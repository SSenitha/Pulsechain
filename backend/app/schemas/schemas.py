from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Literal

HealthType = Literal['nominal', 'amber', 'critical', 'offline']

class UserSchema(BaseModel):
    name: str
    email: str
    role: str
    status: str
    lastActive: str
    model_config = ConfigDict(from_attributes=True)

class UserInviteRequest(BaseModel):
    name: str
    email: str
    role: Literal['Operator', 'Super Admin', 'Viewer']

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserStatusUpdateRequest(BaseModel):
    status: Literal['Active', 'Pending', 'Rejected']
    role: Optional[Literal['Operator', 'Super Admin', 'Viewer']] = None

class TruckSchema(BaseModel):
    id: str
    driver: str
    route: str
    destination: str
    health: HealthType
    temp: float
    humidity: float
    lux: float
    door: str
    risk: int
    eta: str
    ssid: str
    lastSeen: str
    tempMin: float = 2.0
    tempMax: float = 8.0
    model_config = ConfigDict(from_attributes=True)

class TruckRegisterRequest(BaseModel):
    truck_id: str
    driver: str
    base_ssid: str

class TelemetryPointSchema(BaseModel):
    time: str
    temp: float
    humidity: float
    lux: float
    risk: int

class TruckTelemetryResponse(BaseModel):
    truckId: str
    current: TruckSchema
    history: List[TelemetryPointSchema]

class PackageSchema(BaseModel):
    id: str
    product: str
    lot: str
    origin: str
    destination: str
    carrier: str
    tempMin: float
    tempMax: float
    actual: float
    health: HealthType
    risk: int
    truck: str
    eta: str
    tamper: bool
    updated: str
    model_config = ConfigDict(from_attributes=True)

class PackageCreateRequest(BaseModel):
    product: str
    origin: str
    destination: str
    tempMin: float
    tempMax: float

class PackageAssignRequest(BaseModel):
    truck: str
    carrier: str

class TrackingMilestone(BaseModel):
    stage: str
    location: str
    timestamp: str
    status: Literal['completed', 'current', 'pending']

class PublicTrackingResult(BaseModel):
    packageId: str
    product: str
    status: Literal['In Transit', 'Delivered', 'Quarantined']
    currentTemp: float
    tempRange: dict
    isCompliant: bool
    tamperDetected: bool
    lastSeenLocation: str
    timeline: List[TrackingMilestone]

class TelemetryIngestPayload(BaseModel):
    tid: str
    temp: float
    humidity: float
    tamper: bool