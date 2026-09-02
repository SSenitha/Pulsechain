import { apiClient } from './apiClient';
import type { Package, PublicTrackingResult } from '../types';

export const packageService = {

  getPackages: (status?: string) => {
    return apiClient<Package[]>('/packages', {
      params: status ? { status } : undefined,
    });
  },

  // Public endpoint (no auth required)
  trackPackagePublic: (packageId: string) => {
    return apiClient<PublicTrackingResult>(`/public/track/${packageId}`);
  },

  createPackage(data: Partial<Package>) {
    return apiClient('/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // /packages/{package_id}/assign
  // /packages/{package_id}/delivered
};