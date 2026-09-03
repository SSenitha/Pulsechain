import { apiClient } from './apiClient';
import type { Package, PublicTrackingResult } from '../types';

export interface AssignPackagePayload {
  truck: string;
  carrier?: string;
}

export const packageService = {
  // GET /packages - List packages with optional status filter
  getPackages: (status?: string) => {
    return apiClient<Package[]>('/packages', {
      params: status ? { status } : undefined,
    });
  },

  // GET /public/track/:packageId - Public unauthenticated tracking
  trackPackagePublic: (packageId: string) => {
    return apiClient<PublicTrackingResult>(`/public/track/${packageId}`);
  },

  // POST /packages - Create a new consignment
  createPackage: (data: Partial<Package>) => {
    return apiClient<Package>('/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // POST /packages/:packageId/assign - Bind package to an active truck assignment
  assignPackage: (packageId: string, payload: AssignPackagePayload) => {
    return apiClient<Package>(`/packages/${packageId}/assign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /packages/:packageId/delivered - Mark package delivered & close assignment
  markPackageDelivered: (packageId: string) => {
    return apiClient<Package>(`/packages/${packageId}/delivered`, {
      method: 'POST',
    });
  },
};