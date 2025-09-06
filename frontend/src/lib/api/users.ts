import apiClient from './client';
import { User } from '../types/auth';

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const updateUserProfile = async (userId: string, data: UpdateUserPayload): Promise<User> => {
  const response = await apiClient.put<User>(`/api/v1/admin/users/${userId}`, data);
  return response.data;
};