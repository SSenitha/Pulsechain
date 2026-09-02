from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import DBTruck, DBPackage, DBAssignment, DBTelemetry, DBUser, DBLogin
from app.schemas.schemas import TruckSchema, PackageSchema, UserSchema

def evaluate_status(temp: float, temp_min: float, temp_max: float, tamper: bool):
    risk = 8
    health = "nominal"
    
    if tamper:
        risk += 40
        health = "critical"
    
    if temp > temp_max:
        risk += 35
        health = "critical" if temp > (temp_max + 2.0) else "amber"
    elif temp < temp_min:
        risk += 35
        health = "critical" if temp < (temp_min - 2.0) else "amber"
        
    return health, min(risk, 99)

def build_truck_schema(t: DBTruck, db: Session) -> TruckSchema:
    latest = (
        db.query(DBTelemetry)
        .filter(DBTelemetry.tid == t.id)
        .order_by(desc(DBTelemetry.time))
        .first()
    )
    if not latest:
        return TruckSchema(
            id=t.id, driver=t.driver, route=t.route, destination=t.destination,
            health="offline", temp=0.0, humidity=0.0, lux=0.0, door="UNKNOWN",
            risk=0, eta="--:--", ssid=t.ssid, lastSeen="never"
        )

    sec_ago = (datetime.utcnow() - latest.time).total_seconds()
    last_seen = f"{int(sec_ago)}s ago" if sec_ago < 60 else f"{int(sec_ago//60)}m ago"

    health, risk = evaluate_status(latest.temp, 2.0, 8.0, latest.tamper)
    if sec_ago > 300:
        health = "offline"

    return TruckSchema(
        id=t.id, driver=t.driver, route=t.route, destination=t.destination,
        health=health, temp=latest.temp, humidity=latest.humidity,
        lux=40.0 if latest.tamper else 6.0,
        door="OPEN" if latest.tamper else "SEALED",
        risk=risk, eta="03:45", ssid=t.ssid, lastSeen=last_seen
    )

def build_package_schema(p: DBPackage, db: Session) -> PackageSchema:
    active_assignment = (
        db.query(DBAssignment)
        .filter(DBAssignment.package_id == p.id, DBAssignment.unassigned_at == None)
        .first()
    )
    truck_id = active_assignment.truck_id if active_assignment else "UNASSIGNED"
    carrier = active_assignment.truck.driver if active_assignment and active_assignment.truck else "Pending"

    actual_temp = round(p.temp_min + 0.4, 1)
    health = "nominal"
    risk = 8
    tamper = False
    updated = "never"

    if active_assignment:
        latest = (
            db.query(DBTelemetry)
            .filter(DBTelemetry.tid == truck_id)
            .order_by(desc(DBTelemetry.time))
            .first()
        )
        if latest:
            actual_temp = latest.temp
            tamper = latest.tamper
            health, risk = evaluate_status(latest.temp, p.temp_min, p.temp_max, latest.tamper)
            sec_ago = (datetime.utcnow() - latest.time).total_seconds()
            updated = f"{int(sec_ago)}s ago" if sec_ago < 60 else f"{int(sec_ago//60)}m ago"

    return PackageSchema(
        id=p.id, product=p.product, lot=f"LOT-{p.id[-3:]}", origin=p.origin,
        destination=p.destination, carrier=carrier, tempMin=p.temp_min,
        tempMax=p.temp_max, actual=actual_temp, health=health, risk=risk,
        truck=truck_id, eta="02:30", tamper=tamper, updated=updated
    )