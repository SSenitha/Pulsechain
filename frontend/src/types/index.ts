export type Role = 'Operator' | 'Super Admin' | 'Viewer';
export type Health = 'nominal' | 'amber' | 'critical' | 'offline';

export type Truck = {
  id: string;
  driver: string;
  route: string;
  destination: string;
  health: Health;
  temp: number;
  humidity: number;
  lux: number;
  door: string;
  risk: number;
  eta: string;
  ssid: string;
  lastSeen: string;
};

export type Package = {
  id: string;
  product: string;
  lot: string;
  origin: string;
  destination: string;
  carrier: string;
  tempMin: number;
  tempMax: number;
  actual: number;
  health: Health;
  risk: number;
  truck: string;
  eta: string;
  tamper: boolean;
  updated: string;
};

export type User = {
  name: string;
  email: string;
  role: Role;
  status: string;
  lastActive: string;
};

// --- Additions for Charts, Telemetry & Public Tracking ---

export interface TelemetryPoint {
  time: string;
  temp: number;
  humidity: number;
  lux: number;
  risk: number;
}

export interface TruckTelemetry {
  truckId: string;
  current: Truck;
  history: TelemetryPoint[];
}

export interface TrackingMilestone {
  stage: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
}

export interface PublicTrackingResult {
  packageId: string;
  product: string;
  status: 'In Transit' | 'Delivered' | 'Quarantined';
  currentTemp: number;
  tempRange: { min: number; max: number };
  isCompliant: boolean;
  tamperDetected: boolean;
  lastSeenLocation: string; // derived from SSID
  timeline: TrackingMilestone[];
}