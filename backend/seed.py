from datetime import datetime, timedelta
import random
from app.db.session import engine, SessionLocal, Base
from app.models.models import DBUser, DBTruck, DBPackage, DBAssignment, DBTelemetry, DBLogin

def run_seed():
    print("[SEED] Resetting and seeding database for 6 trucks...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Users (Dev build: unified password 'guardian-demo', Mara is Super Admin)
        DEV_PASSWORD = "guardian-demo"
        u1 = DBUser(email="mara.okafor@northstarlogistics.co", name="Mara Okafor", role="Super Admin", status="Active", password=DEV_PASSWORD)
        u2 = DBUser(email="admin@pulsechain.io", name="K. Sandaru", role="Super Admin", status="Active", password=DEV_PASSWORD)
        u3 = DBUser(email="operator@pulsechain.io", name="Ana Petrov", role="Operator", status="Active", password=DEV_PASSWORD)
        u4 = DBUser(email="theo.nguyen@northstarlogistics.co", name="Theo Nguyen", role="Viewer", status="Active", password=DEV_PASSWORD)
        u5 = DBUser(email="priya.nanduri@northstarlogistics.co", name="Priya Nanduri", role="Super Admin", status="Active", password=DEV_PASSWORD)
        u6 = DBUser(email="jon.bell@northstarlogistics.co", name="Jon Bell", role="Operator", status="Active", password=DEV_PASSWORD)
        db.add_all([u1, u2, u3, u4, u5, u6])
        db.commit()

        # Logins
        l1 = DBLogin(user_email=u1.email, time=datetime.utcnow())
        db.add(l1)

        # 6 Trucks across Sri Lanka logistics corridors
        t1 = DBTruck(id="TRK-101", driver="Sol Kim", route="Colombo → Kandy", destination="Kandy General Hospital", ssid="SLT_Mobitel_4G_Hub")
        t2 = DBTruck(id="TRK-102", driver="K. Perera", route="Galle → Negombo", destination="Negombo Base Hospital", ssid="Expressway_North_WLAN")
        t3 = DBTruck(id="TRK-103", driver="Ana Petrov", route="Jaffna → Dambulla", destination="Central Medical DC", ssid="Dambulla_Local_Hub")
        t4 = DBTruck(id="TRK-104", driver="Liam Foster", route="Colombo → Galle", destination="Karapitiya Hospital", ssid="Southern_Highway_Mesh")
        t5 = DBTruck(id="TRK-105", driver="Inez Shah", route="Trincomalee → Anuradhapura", destination="Anuradhapura Teaching Hospital", ssid="NorthCentral_Node_02")
        t6 = DBTruck(id="TRK-106", driver="Mara Okafor", route="Matara → Colombo Port", destination="ColdVault Logistics Hub", ssid="Port_Inbound_WLAN")
        db.add_all([t1, t2, t3, t4, t5, t6])
        db.commit()

        # 6 Packages with tailored clinical temperature bands
        p1 = DBPackage(id="PKG-VAX-881", product="mRNA COVID-19 Vaccine", origin="Colombo Port", destination="Kandy General Hospital", temp_min=2.0, temp_max=8.0)
        p2 = DBPackage(id="PKG-INS-409", product="Rapid-Acting Recombinant Insulin", origin="Galle DC", destination="Negombo Base Hospital", temp_min=2.0, temp_max=6.0)
        p3 = DBPackage(id="PKG-BLD-103", product="Packed Red Blood Cells (PRBC)", origin="Jaffna Blood Bank", destination="Central Medical DC", temp_min=1.0, temp_max=6.0)
        p4 = DBPackage(id="PKG-ONC-504", product="Monoclonal Antibody (Oncology)", origin="Colombo Central Lab", destination="Karapitiya Hospital", temp_min=2.0, temp_max=8.0)
        p5 = DBPackage(id="PKG-PLZ-605", product="Fresh Frozen Plasma (FFP)", origin="Trincomalee Blood Center", destination="Anuradhapura Teaching Hospital", temp_min=-25.0, temp_max=-15.0)
        p6 = DBPackage(id="PKG-BIO-706", product="Pediatric Measles-Rubella Vaccine", origin="Matara Provincial Depot", destination="ColdVault Logistics Hub", temp_min=2.0, temp_max=8.0)
        db.add_all([p1, p2, p3, p4, p5, p6])
        db.commit()

        # Consignment Assignments
        now = datetime.utcnow()
        a1 = DBAssignment(package_id=p1.id, truck_id=t1.id, assigned_at=now - timedelta(hours=3))
        a2 = DBAssignment(package_id=p2.id, truck_id=t2.id, assigned_at=now - timedelta(hours=2))
        a3 = DBAssignment(package_id=p3.id, truck_id=t3.id, assigned_at=now - timedelta(hours=4))
        a4 = DBAssignment(package_id=p4.id, truck_id=t4.id, assigned_at=now - timedelta(hours=1))
        a5 = DBAssignment(package_id=p5.id, truck_id=t5.id, assigned_at=now - timedelta(hours=5))
        a6 = DBAssignment(package_id=p6.id, truck_id=t6.id, assigned_at=now - timedelta(minutes=45))
        db.add_all([a1, a2, a3, a4, a5, a6])
        db.commit()

        # Historical Telemetry: 30 data points per truck with a SHORT period (15s intervals)
        # This replaces the old 5-minute spacing with tight, high-resolution telemetry.
        NUM_POINTS = 30
        INTERVAL_SECONDS = 15

        for i in range(NUM_POINTS):
            t_time = now - timedelta(seconds=(NUM_POINTS - 1 - i) * INTERVAL_SECONDS)

            # TRK-101: Steady nominal cold chain (around 4.2°C to 4.5°C)
            t1_temp = round(4.2 + (0.3 * (i % 4) / 4.0) + random.uniform(-0.08, 0.08), 1)
            t1_hum = round(54.0 + random.uniform(-1.5, 1.5), 1)
            db.add(DBTelemetry(tid="TRK-101", time=t_time, temp=t1_temp, humidity=t1_hum, tamper=False))

            # TRK-102: Steady cold chain insulin (around 3.5°C to 3.9°C)
            t2_temp = round(3.5 + (0.4 * ((i + 2) % 5) / 5.0) + random.uniform(-0.05, 0.05), 1)
            t2_hum = round(48.0 + random.uniform(-1.0, 1.0), 1)
            db.add(DBTelemetry(tid="TRK-102", time=t_time, temp=t2_temp, humidity=t2_hum, tamper=False))

            # TRK-103: PERMANENT RED CRITICAL (Door breached, severe thermal excursion 9.8C - 10.8C)
            t3_temp = round(10.2 + (0.4 * (i % 5) / 5.0) + random.uniform(-0.1, 0.1), 1)
            t3_hum = round(76.0 + random.uniform(-1.0, 1.0), 1)
            db.add(DBTelemetry(tid="TRK-103", time=t_time, temp=t3_temp, humidity=t3_hum, tamper=True))

            # TRK-104: Amber thermal drift excursion (8.2C to 8.8C on recent readings)
            is_amber_104 = (i >= NUM_POINTS - 8)
            t4_temp = round((8.5 if is_amber_104 else 6.8) + random.uniform(-0.1, 0.1), 1)
            t4_hum = round(58.0 + random.uniform(-1.0, 1.0), 1)
            db.add(DBTelemetry(tid="TRK-104", time=t_time, temp=t4_temp, humidity=t4_hum, tamper=False))

            # TRK-105: Deep-Freeze Unit (-20.5°C to -18.5°C)
            t5_temp = round(-20.0 + 1.2 * ((i % 8) - 4) / 4.0 + random.uniform(-0.1, 0.1), 1)
            t5_hum = round(38.0 + random.uniform(-0.8, 0.8), 1)
            db.add(DBTelemetry(tid="TRK-105", time=t_time, temp=t5_temp, humidity=t5_hum, tamper=False))

            # TRK-106: Nominal standard unit (4.9°C to 5.2°C)
            t6_temp = round(5.0 + random.uniform(-0.2, 0.2), 1)
            t6_hum = round(51.0 + random.uniform(-1.2, 1.2), 1)
            db.add(DBTelemetry(tid="TRK-106", time=t_time, temp=t6_temp, humidity=t6_hum, tamper=False))

        db.commit()
        print(f"[SUCCESS] Database successfully seeded with 6 trucks and {NUM_POINTS * 6} high-resolution telemetry points (15s interval)!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()