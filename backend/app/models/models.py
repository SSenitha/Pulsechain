from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class DBUser(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'Operator' | 'Super Admin' | 'Viewer'

    logins = relationship("DBLogin", back_populates="user")

class DBLogin(Base):
    __tablename__ = "logins"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, ForeignKey("users.email"))
    time = Column(DateTime, default=datetime.utcnow)

    user = relationship("DBUser", back_populates="logins")

class DBTruck(Base):
    __tablename__ = "trucks"
    id = Column(String, primary_key=True, index=True)
    driver = Column(String, default="Unassigned")
    route = Column(String, default="Pending")
    destination = Column(String, default="Pending")
    ssid = Column(String, default="PENDING")

    telemetry = relationship("DBTelemetry", back_populates="truck", cascade="all, delete-orphan")
    assignments = relationship("DBAssignment", back_populates="truck")

class DBPackage(Base):
    __tablename__ = "packages"
    id = Column(String, primary_key=True, index=True)
    product = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    temp_min = Column(Float, nullable=False)
    temp_max = Column(Float, nullable=False)

    assignments = relationship("DBAssignment", back_populates="package")

class DBAssignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    package_id = Column(String, ForeignKey("packages.id"))
    truck_id = Column(String, ForeignKey("trucks.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    unassigned_at = Column(DateTime, nullable=True)

    package = relationship("DBPackage", back_populates="assignments")
    truck = relationship("DBTruck", back_populates="assignments")

class DBTelemetry(Base):
    __tablename__ = "telemetry"
    tid = Column(String, ForeignKey("trucks.id"), primary_key=True)
    time = Column(DateTime, primary_key=True, default=datetime.utcnow)
    temp = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    tamper = Column(Boolean, default=False)

    truck = relationship("DBTruck", back_populates="telemetry")