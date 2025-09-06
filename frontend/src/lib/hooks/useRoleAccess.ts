import { useAuth } from '@/lib/store/authStore';
import { ROLES } from '@/lib/utils/constants';

export const useRoleAccess = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (requiredRole: keyof typeof ROLES): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === ROLES[requiredRole];
  };

  const hasAnyRole = (requiredRoles: (keyof typeof ROLES)[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return requiredRoles.some(role => user.role === ROLES[role]);
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isStudent = (): boolean => {
    return hasRole('STUDENT');
  };

  const isInstructor = (): boolean => {
    return hasRole('INSTRUCTOR');
  };

  const canAccessAdminPanel = (): boolean => {
    return isAdmin();
  };

  const canManageCourses = (): boolean => {
    return isAdmin(); // Only admins can manage courses per requirements
  };

  const canViewAllStudents = (): boolean => {
    return hasAnyRole(['ADMIN', 'INSTRUCTOR']);
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const canAccessFinancialReports = (): boolean => {
    return isAdmin();
  };

  const canRegisterForCourses = (): boolean => {
    return isStudent();
  };

  const getUserDisplayInfo = (): {
    fullName: string;
    role: string;
    identifier: string;
  } | null => {
    if (!user) return null;

    return {
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role || 'STUDENT',
      identifier: user.studentId || user.employeeId || user.username || 'N/A',
    };
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStudent,
    isInstructor,
    canAccessAdminPanel,
    canManageCourses,
    canViewAllStudents,
    canManageUsers,
    canAccessFinancialReports,
    canRegisterForCourses,
    getUserDisplayInfo,
  };
};
