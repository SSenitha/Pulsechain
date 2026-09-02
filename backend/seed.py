from datetime import datetime, timedelta
from app.db.session import engine, SessionLocal, Base
from app.models.models import DBUser, DBTruck, DBPackage, DBAssignment, DBTelemetry, DBLogin

def run_seed():
    print("🌱 Resetting and seeding database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Users
        u1 = DBUser(email="admin@pulsechain.io", name="K. Sandaru", role="Super Admin")
        u2 = DBUser(email="operator@pulsechain.io", name="Ana Petrov", role="Operator")
        db.add_all([u1, u2])

        # Logins
        l1 = DBLogin(user_email=u1.email, time=datetime.utcnow())
        db.add(l1)

        # Trucks
        t1 = DBTruck(id="TRK-101", driver="Sol Kim", route="Colombo → Kandy", destination="Kandy Hospital", ssid="SLT_Mobitel_4G_Hub")
        t2 = DBTruck(id="TRK-102", driver="K. Perera", route="Galle → Negombo", destination="Negombo Hub", ssid="Expressway_North_WLAN")
        t3 = DBTruck(id="TRK-103", driver="Ana Petrov", route="Jaffna → Dambulla", destination="Central DC", ssid="Dambulla_Local_Hub")
        db.add_all([t1, t2, t3])
        db.commit()

        # Packages
        p1 = DBPackage(id="PKG-VAX-881", product="mRNA COVID Vaccine", origin="Colombo Port", destination="Kandy Hospital", temp_min=2.0, temp_max=8.0)
        p2 = DBPackage(id="PKG-INS-409", product="Rapid-Acting Insulin", origin="Galle DC", destination="Negombo Hub", temp_min=2.0, temp_max=6.0)
        db.add_all([p1, p2])
        db.commit()

        # Assignments
        a1 = DBAssignment(package_id=p1.id, truck_id=t1.id, assigned_at=datetime.utcnow() - timedelta(hours=2))
        a2 = DBAssignment(package_id=p2.id, truck_id=t2.id, assigned_at=datetime.utcnow() - timedelta(hours=1))
        db.add_all([a1, a2])

        # Historical Telemetry
        now = datetime.utcnow()
        for i in range(10):
            t_time = now - timedelta(minutes=(10 - i) * 5)
            db.add(DBTelemetry(tid="TRK-101", time=t_time, temp=4.2 + (i * 0.1), humidity=60.0, tamper=False))
            # TRK-103 has an excursion & tamper
            db.add(DBTelemetry(tid="TRK-103", time=t_time, temp=9.5, humidity=75.0, tamper=(i >= 8)))

        db.commit()
        print("✅ Database successfully seeded!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()