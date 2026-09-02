from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import engine, get_db, Base
from app.models.models import DBTruck, DBPackage, DBAssignment, DBTelemetry, DBUser, DBLogin
from app.schemas.schemas import (
    TruckSchema, PackageSchema, UserSchema,
    TruckTelemetryResponse, TelemetryPointSchema,
    PublicTrackingResult, TelemetryIngestPayload
)
from app.services.aggregator import build_truck_schema, build_package_schema

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pulsechain Guardian Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "online", "system": "Pulsechain Guardian Backend"}

# --- INGESTION ---
@app.post("/api/v1/telemetry/ingest", tags=["Ingestion"])
def ingest_telemetry(payload: TelemetryIngestPayload, db: Session = Depends(get_db)):
    truck = db.query(DBTruck).filter(DBTruck.id == payload.tid).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")

    log = DBTelemetry(
        tid=payload.tid,
        temp=payload.temp,
        humidity=payload.humidity,
        tamper=payload.tamper,
        time=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    return {"status": "success", "tid": log.tid, "time": log.time}

# --- FLEET ---
@app.get("/api/v1/fleet/overview", response_model=List[TruckSchema], tags=["Fleet"])
def get_fleet_overview(db: Session = Depends(get_db)):
    trucks = db.query(DBTruck).all()
    return [build_truck_schema(t, db) for t in trucks]

@app.get("/api/v1/fleet/{truck_id}/telemetry", response_model=TruckTelemetryResponse, tags=["Fleet"])
def get_truck_telemetry(truck_id: str, limit: int = 50, db: Session = Depends(get_db)):
    truck = db.query(DBTruck).filter(DBTruck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")

    current = build_truck_schema(truck, db)
    history_logs = (
        db.query(DBTelemetry)
        .filter(DBTelemetry.tid == truck_id)
        .order_by(desc(DBTelemetry.time))
        .limit(limit)
        .all()
    )
    history_logs.reverse()

    history = [
        TelemetryPointSchema(
            time=h.time.strftime("%H:%M"),
            temp=h.temp,
            humidity=h.humidity,
            lux=40.0 if h.tamper else 6.0,
            risk=80 if h.tamper or h.temp > 8.0 else 12
        )
        for h in history_logs
    ]
    return TruckTelemetryResponse(truckId=truck.id, current=current, history=history)

# --- PACKAGES ---
@app.get("/api/v1/packages", response_model=List[PackageSchema], tags=["Packages"])
def get_packages(db: Session = Depends(get_db)):
    packages = db.query(DBPackage).all()
    return [build_package_schema(p, db) for p in packages]

# --- PUBLIC TRACKING ---
@app.get("/api/v1/public/track/{package_id}", response_model=PublicTrackingResult, tags=["Public"])
def track_package_public(package_id: str, db: Session = Depends(get_db)):
    pkg = db.query(DBPackage).filter(DBPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package tracking ID not found")

    pkg_view = build_package_schema(pkg, db)
    truck = db.query(DBTruck).filter(DBTruck.id == pkg_view.truck).first()
    location_str = truck.ssid if truck else "Central Cold Hub"
    is_compliant = (pkg_view.actual <= pkg.temp_max) and not pkg_view.tamper

    return PublicTrackingResult(
        packageId=pkg.id,
        product=pkg.product,
        status="In Transit" if pkg_view.truck != "UNASSIGNED" else "Delivered",
        currentTemp=pkg_view.actual,
        tempRange={"min": pkg.temp_min, "max": pkg.temp_max},
        isCompliant=is_compliant,
        tamperDetected=pkg_view.tamper,
        lastSeenLocation=location_str,
        timeline=[
            {"stage": "ORIGIN SCAN", "location": pkg.origin, "timestamp": "08:00:00", "status": "completed"},
            {"stage": "ASSIGNED CARRIER", "location": f"Truck {pkg_view.truck}", "timestamp": "09:30:00", "status": "completed"},
            {"stage": "TRANSIT NODE", "location": location_str, "timestamp": "11:15:00", "status": "current"},
            {"stage": "DESTINATION", "location": pkg.destination, "timestamp": pkg_view.eta, "status": "pending"}
        ]
    )

# --- USERS ---
@app.get("/api/v1/admin/users", response_model=List[UserSchema], tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    res = []
    for u in users:
        latest_login = db.query(DBLogin).filter(DBLogin.user_email == u.email).order_by(desc(DBLogin.time)).first()
        res.append(UserSchema(
            name=u.name, email=u.email, role=u.role,
            status="Active" if latest_login else "Invited",
            lastActive=latest_login.time.strftime("%H:%M:%S") if latest_login else "never"
        ))
    return res