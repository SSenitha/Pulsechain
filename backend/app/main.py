import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import engine, Base, get_db
from app.models.models import DBUser, DBLogin, DBTruck, DBPackage, DBAssignment, DBTelemetry
from app.schemas.schemas import (
    TruckSchema, PackageSchema, UserSchema, TruckTelemetryResponse, TelemetryPointSchema, 
    PublicTrackingResult, TelemetryIngestPayload, PackageCreateRequest, PackageAssignRequest, 
    TruckRegisterRequest, TrackingMilestone, UserInviteRequest
)
from app.services.aggregator import(
    # evaluate_status, format_relative_time, 
    build_truck_schema, build_package_schema
)

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pulsechain Guardian API", version="1.0.0")

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

# ----------------- TELEMETRY INGESTION -----------------
@app.post("/api/v1/telemetry/ingest", tags=["Telemetry"])
def ingest_telemetry(payload: TelemetryIngestPayload, db: Session = Depends(get_db)):
    truck = db.query(DBTruck).filter(DBTruck.id == payload.tid).first()
    if not truck:
        raise HTTPException(status_code=404, detail=f"Truck '{payload.tid}' does not exist")

    record = DBTelemetry(
        tid=payload.tid,
        time=datetime.utcnow(),
        temp=payload.temp,
        humidity=payload.humidity,
        tamper=payload.tamper
    )
    db.add(record)
    db.commit()
    return {"status": "success", "tid": payload.tid, "recorded_at": record.time.isoformat()}

# ----------------- FLEET -----------------
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

@app.post("/api/v1/fleet/register", response_model=TruckSchema, tags=["Fleet"])
def register_truck(data: TruckRegisterRequest, db: Session = Depends(get_db)):
    if db.query(DBTruck).filter(DBTruck.id == data.truck_id).first():
        raise HTTPException(status_code=400, detail="Truck ID already registered")

    new_truck = DBTruck(
        id=data.truck_id,
        driver=data.driver,
        ssid=data.base_ssid,
        route="Pending Route",
        destination="Pending Destination"
    )
    db.add(new_truck)
    db.commit()
    db.refresh(new_truck)
    return TruckSchema(
        id=new_truck.id, driver=new_truck.driver, route=new_truck.route, destination=new_truck.destination,
        health="offline", temp=0.0, humidity=0.0, lux=0.0, door="UNKNOWN",
        risk=0, eta="--:--:--", ssid=new_truck.ssid, lastSeen="never"
    )

# ----------------- PACKAGES -----------------
@app.get("/api/v1/packages", response_model=List[PackageSchema], tags=["Packages"])
def get_packages(db: Session = Depends(get_db)):
    packages = db.query(DBPackage).all()
    return [build_package_schema(p, db) for p in packages]

@app.post("/api/v1/packages", response_model=PackageSchema, tags=["Packages"])
def create_package(data: PackageCreateRequest, db: Session = Depends(get_db)):
    pkg_id = f"PKG-{uuid.uuid4().hex[:6].upper()}"
    new_pkg = DBPackage(
        id=pkg_id,
        product=data.product,
        origin=data.origin,
        destination=data.destination,
        temp_min=data.tempMin,
        temp_max=data.tempMax
    )
    db.add(new_pkg)
    db.commit()
    db.refresh(new_pkg)

    return PackageSchema(
        id=new_pkg.id, product=new_pkg.product, lot=f"LOT-{new_pkg.id[-4:]}", origin=new_pkg.origin,
        destination=new_pkg.destination, carrier="Pending", tempMin=new_pkg.temp_min,
        tempMax=new_pkg.temp_max, actual=round(new_pkg.temp_min + 0.4, 1), health="nominal",
        risk=8, truck="UNASSIGNED", eta="04:00:00", tamper=False, updated="just now"
    )

@app.post("/api/v1/packages/{package_id}/assign", response_model=PackageSchema, tags=["Packages"])
def assign_package(package_id: str, data: PackageAssignRequest, db: Session = Depends(get_db)):
    pkg = db.query(DBPackage).filter(DBPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    truck = db.query(DBTruck).filter(DBTruck.id == data.truck).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")

    # Close any existing assignment
    current_assign = (
        db.query(DBAssignment)
        .filter(DBAssignment.package_id == pkg.id, DBAssignment.unassigned_at == None)
        .first()
    )
    if current_assign:
        current_assign.unassigned_at = datetime.utcnow()

    # Create new assignment
    new_assign = DBAssignment(package_id=pkg.id, truck_id=truck.id, assigned_at=datetime.utcnow())
    db.add(new_assign)
    db.commit()

    return PackageSchema(
        id=pkg.id, product=pkg.product, lot=f"LOT-{pkg.id[-4:]}", origin=pkg.origin, destination=pkg.destination,
        carrier=truck.driver, tempMin=pkg.temp_min, tempMax=pkg.temp_max, actual=round(pkg.temp_min + 0.4, 1),
        health="nominal", risk=8, truck=truck.id, eta="03:30:00", tamper=False, updated="just now"
    )

@app.post("/api/v1/packages/{package_id}/delivered", response_model=PackageSchema, tags=["Packages"])
def assign_package(package_id: str, db: Session = Depends(get_db)):
    pkg = db.query(DBPackage).filter(DBPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    current_assign = (
            db.query(DBAssignment)
            .filter(DBAssignment.package_id == pkg.id, DBAssignment.unassigned_at == None)
            .first()
        )
    if current_assign:
            current_assign.unassigned_at = datetime.utcnow()

    return PackageSchema(
        id=pkg.id, product=pkg.product, lot=f"LOT-{pkg.id[-4:]}", origin=pkg.origin, destination=pkg.destination,
        carrier="None", tempMin=pkg.temp_min, tempMax=pkg.temp_max, actual=round(pkg.temp_min + 0.4, 1),
        health="nominal", risk=8, truck="None", eta="delivered", tamper=False, updated="delivered"
    )

# ----------------- PUBLIC TRACKING -----------------
@app.get("/api/v1/public/track/{package_id}", response_model=PublicTrackingResult, tags=["Public"])
def track_package_public(package_id: str, db: Session = Depends(get_db)):
    pkg = db.query(DBPackage).filter(DBPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    active_assign = (
        db.query(DBAssignment)
        .filter(DBAssignment.package_id == pkg.id, DBAssignment.unassigned_at == None)
        .first()
    )

    truck = active_assign.truck if active_assign else None
    current_temp = pkg.temp_min + 0.4
    tamper = False
    location_str = truck.ssid if truck else "Central Depot Storage"

    if truck:
        latest = (
            db.query(DBTelemetry)
            .filter(DBTelemetry.tid == truck.id)
            .order_by(desc(DBTelemetry.time))
            .first()
        )
        if latest:
            current_temp = latest.temp
            tamper = latest.tamper

    is_compliant = (current_temp <= pkg.temp_max) and (current_temp >= pkg.temp_min) and not tamper

    return PublicTrackingResult(
        packageId=pkg.id,
        product=pkg.product,
        status="In Transit" if truck else "Delivered",
        currentTemp=round(current_temp, 1),
        tempRange={"min": pkg.temp_min, "max": pkg.temp_max},
        isCompliant=is_compliant,
        tamperDetected=tamper,
        lastSeenLocation=location_str,
        timeline=[
            TrackingMilestone(stage="ORIGIN SCAN", location=pkg.origin, timestamp="08:24:42", status="completed"),
            TrackingMilestone(stage="SEALED HANDOFF", location=f"Asset {truck.id if truck else 'Depot'}", timestamp="09:16:08", status="completed"),
            TrackingMilestone(stage="IN TRANSIT", location=location_str, timestamp="11:08:31", status="current" if truck else "completed"),
            TrackingMilestone(stage="DELIVERY", location=pkg.destination, timestamp="15:45:00", status="pending" if truck else "completed")
        ]
    )

# ----------------- ADMIN & USERS -----------------
@app.get("/api/v1/admin/users", response_model=List[UserSchema], tags=["Admin"])
def get_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    results = []
    for u in users:
        latest_login = (
            db.query(DBLogin)
            .filter(DBLogin.user_email == u.email)
            .order_by(desc(DBLogin.time))
            .first()
        )
        results.append(UserSchema(
            name=u.name,
            email=u.email,
            role=u.role,
            status="Active" if latest_login else "Invited",
            lastActive=format_relative_time(latest_login.time) if latest_login else "never"
        ))
    return results

@app.post("/api/v1/admin/users/invite", response_model=UserSchema, tags=["Admin"])
def invite_user(data: UserInviteRequest, db: Session = Depends(get_db)):
    if db.query(DBUser).filter(DBUser.email == data.email).first():
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = DBUser(name=data.name, email=data.email, role=data.role)
    db.add(new_user)
    db.commit()
    return UserSchema(name=new_user.name, email=new_user.email, role=new_user.role, status="Invited", lastActive="never")

# ----------------- ANALYTICS -----------------
@app.get("/api/v1/analytics/overview", tags=["Analytics"])
def get_analytics_overview(db: Session = Depends(get_db)):
    nominal_count = 0
    amber_count = 0
    crit_count = 0

    trucks = db.query(DBTruck).all()
    for t in trucks:
        latest = (
            db.query(DBTelemetry)
            .filter(DBTelemetry.tid == t.id)
            .order_by(desc(DBTelemetry.time))
            .first()
        )
        if latest:
            h, _ = evaluate_status(latest.temp, 2.0, 8.0, latest.tamper)
            if h == "nominal":
                nominal_count += 1
            elif h == "amber":
                amber_count += 1
            elif h == "critical":
                crit_count += 1

    return {
        "kpi": {
            "riskIndex": 28.4,
            "riskDelta": -3.2,
            "openAnomalies": amber_count + crit_count,
            "resolvedAnomalies": 9,
            "meanRecoveryMinutes": 14,
            "signalCoveragePercent": 98.8
        },
        "correlation": [
            {"name": "Temp drift", "risk": 78},
            {"name": "Door cycles", "risk": 64},
            {"name": "Humidity", "risk": 41},
            {"name": "Lux exposure", "risk": 29},
            {"name": "Latency", "risk": 18}
        ],
        "riskDistribution": [
            {"name": "Nominal", "value": max(nominal_count, 1), "color": "#4ed69a"},
            {"name": "Predicted", "value": amber_count, "color": "#f7a94a"},
            {"name": "Critical", "value": crit_count, "color": "#f06d80"}
        ],
        "audit": [
            {"time": "10:42:18", "id": "ANOM-2281", "asset": "TRK-103", "observation": "Tamper latch opened", "state": "CRITICAL"}
        ]
    }