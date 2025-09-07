import { api } from './generated';
import { User } from '../types/auth';

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

export const updateUserProfile = async (data: UpdateUserPayload): Promise<User> => {
  const res = await api.user.updateMe(data);
  // apiClient returns a Response wrapper with data
  return (res.data as unknown as User)!;
};