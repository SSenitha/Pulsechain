import { apiClient } from './apiClient';
import type { TruckTelemetry, Truck } from '../types';

export const fleetService = {
  // Fetch high-level status for the fleet grid + emergency row
  getFleetOverview: () => {
    return apiClient<Truck[]>('/fleet/overview');
  },

  // Fetch detailed telemetry history for the side pane
  getTruckTelemetry: (truckId: string, limit: number = 50) => {
    return apiClient<TruckTelemetry>(`/fleet/${truckId}/telemetry`, {
      params: { limit },
    });
  },

  // Register a new truck (Admin action)
  registerTruck: (payload: { truck_id: string; driver: string; base_ssid: string }) => {
    return apiClient('/fleet/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};