import { apiClient } from './apiClient';
import type { TruckTelemetry, Truck } from '../types';

export interface RegisterTruckPayload {
  truck_id: string;
  driver: string;
  base_ssid: string;
  route: string;
  destination: string;
}

export const fleetService = {
  getFleetOverview: () => {
    return apiClient<Truck[]>('/fleet');
  },

  getTruckTelemetry: (truckId: string, limit: number = 50) => {
    return apiClient<TruckTelemetry>(`/fleet/${truckId}/telemetry`, {
      params: { limit },
    });
  },

  registerTruck: (payload: RegisterTruckPayload) => {
    return apiClient<Truck>('/fleet/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};