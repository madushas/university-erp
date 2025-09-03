import { useAuth as useAuthContext } from '@/lib/store/authStore';
import { secureStorage } from '@/lib/utils/secureStorage';
import { hasRole } from '@/lib/utils/jwt';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    logout, 
    register,
    refreshAuth
  } = useAuthContext();

  // Auth context handles initial check automatically

  const checkRole = (role: string): boolean => {
    const token = secureStorage.getAccessToken();
    return token ? hasRole(token, role) : false;
  };

  const isAdmin = (): boolean => checkRole('ROLE_ADMIN');
  const isStudent = (): boolean => checkRole('ROLE_STUDENT');

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    checkRole,
    isAdmin,
    isStudent,
    refreshAuth,
  };
};