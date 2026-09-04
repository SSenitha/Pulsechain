import { apiClient } from './apiClient';
import type { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Computes SHA-256 hash of email + password on the client side
 * so that raw plain-text passwords never leave the browser.
 */
export async function hashCredentials(email: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${email.toLowerCase().trim()}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const passwordHash = await hashCredentials(payload.email, payload.password);
    return apiClient<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        password: passwordHash,
      }),
    });
  },

  login: async (payload: LoginPayload) => {
    const passwordHash = await hashCredentials(payload.email, payload.password);
    return apiClient<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        password: passwordHash,
      }),
    });
  },
};
