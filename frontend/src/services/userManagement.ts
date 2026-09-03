import { apiClient } from './apiClient';
import type { User, Role } from '../types';

export interface InviteUserPayload {
  name: string;
  email: string;
  role: Role;
}

export const userService = {
  // GET /admin/users - List all users
  getUsers: () => {
    return apiClient<User[]>('/admin/users');
  },

  // POST /admin/users/invite - Invite new user with assigned role
  inviteUser: (payload: InviteUserPayload) => {
    return apiClient<User>('/admin/users/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};