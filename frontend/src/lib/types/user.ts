export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  department?: string;
  enrollmentDate?: string;
}