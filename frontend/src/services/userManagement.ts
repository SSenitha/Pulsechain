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

  // PATCH /admin/users/{email}/status - Approve/Reject user status & update role
  updateUserStatus: (email: string, status: 'Active' | 'Pending' | 'Rejected', role?: Role) => {
    return apiClient<User>(`/admin/users/${encodeURIComponent(email)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, role }),
    });
  },

  // DELETE /admin/users/{email} - Delete user profile
  deleteUser: (email: string) => {
    return apiClient<{ status: string; message: string }>(`/admin/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  },
};