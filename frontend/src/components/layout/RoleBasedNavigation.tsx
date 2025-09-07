'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { normalizeRole, rolesInclude } from '@/lib/utils/constants';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  BookOpen,
  Users,
  FileText,
  Settings,
  BarChart3,
  GraduationCap,
  Calendar,
  ClipboardList,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
  },
  {
    label: 'Courses',
    href: '/courses',
    icon: BookOpen,
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
    children: [
      {
        label: 'Browse Courses',
        href: '/courses',
        icon: BookOpen,
        roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
      },
      {
        label: 'My Courses',
        href: '/courses/my',
        icon: GraduationCap,
        roles: ['STUDENT', 'INSTRUCTOR']
      }
    ]
  },
  {
    label: 'Students',
    href: '/students',
    icon: Users,
    roles: ['STUDENT', 'ADMIN'],
    children: [
      {
        label: 'Academic Records',
        href: '/students/records',
        icon: FileText,
        roles: ['STUDENT', 'ADMIN']
      },
      {
        label: 'Degree Audit',
        href: '/students/audit',
        icon: GraduationCap,
        roles: ['STUDENT', 'ADMIN']
      },
      {
        label: 'Applications',
        href: '/students/applications',
        icon: ClipboardList,
        roles: ['STUDENT', 'ADMIN']
      }
    ]
  },
  {
    label: 'HR Management',
    href: '/hr',
    icon: Shield,
    roles: ['INSTRUCTOR', 'ADMIN'],
    children: [
      {
        label: 'Employees',
        href: '/hr/employees',
        icon: Users,
        roles: ['ADMIN']
      },
      {
        label: 'Leave Requests',
        href: '/hr/leave',
        icon: Calendar,
        roles: ['INSTRUCTOR', 'ADMIN']
      },
      {
        label: 'Reports',
        href: '/hr/reports',
        icon: BarChart3,
        roles: ['ADMIN']
      }
    ]
  },
  {
    label: 'Administration',
    href: '/admin',
    icon: Settings,
    roles: ['ADMIN'],
    children: [
      {
        label: 'User Management',
        href: '/admin/users',
        icon: Users,
        roles: ['ADMIN']
      },
      {
        label: 'System Settings',
        href: '/admin/system',
        icon: Settings,
        roles: ['ADMIN']
      },
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        roles: ['ADMIN']
      }
    ]
  }
];

interface RoleBasedNavigationProps {
  className?: string;
}

export function RoleBasedNavigation({ className = '' }: RoleBasedNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const hasAccess = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    const userRole = normalizeRole(user.role);
    return rolesInclude(userRole ? [userRole] : [], roles);
  };

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const filteredNavigationItems = navigationItems.filter(item => hasAccess(item.roles));

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              University Portal
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.href);

              return (
                <div key={item.href} className="relative">
                  {hasChildren ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          active
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        data-testid={`nav-dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {isExpanded && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                          {item.children?.filter(child => hasAccess(child.roles)).map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActive(child.href);
                            
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                                  childActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                                onClick={() => setExpandedItems([])}
                                data-testid={`nav-link-${child.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <ChildIcon className="mr-2 h-4 w-4" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        active
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    {normalizeRole(user.role) || user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/profile')}
                  className="p-2"
                  data-testid="profile-button"
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2"
                  data-testid="logout-button"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.href);

                return (
                  <div key={item.href}>
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.href)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                            active
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="mr-3 h-5 w-5" />
                            {item.label}
                          </div>
                          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children?.filter(child => hasAccess(child.roles)).map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = isActive(child.href);
                              
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    childActive
                                      ? 'text-blue-600 bg-blue-50'
                                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <ChildIcon className="mr-2 h-4 w-4" />
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          active
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
              
              {/* Mobile User Actions */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-base font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {normalizeRole(user.role) || user.role}
                    </Badge>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}