'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  Menu,
  Settings,
  Users,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

interface NavigationProps {
  userRole?: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR'
  userName?: string
}

interface NavigationItem {
  href: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: string
}

const navigationItems: Record<string, NavigationItem[]> = {
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, badge: 'New' },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/departments', label: 'Departments', icon: GraduationCap },
    { href: '/admin/schedule', label: 'Schedule', icon: Calendar },
    { href: '/admin/settings', label: 'Settings', icon: Settings }
  ],
  STUDENT: [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/courses', label: 'My Courses', icon: BookOpen },
    { href: '/student/schedule', label: 'Schedule', icon: Calendar },
    { href: '/student/grades', label: 'Grades', icon: BarChart3 },
    { href: '/student/profile', label: 'Profile', icon: User }
  ],
  INSTRUCTOR: [
    { href: '/instructor/dashboard', label: 'Dashboard', icon: Home },
    { href: '/instructor/courses', label: 'My Courses', icon: BookOpen },
    { href: '/instructor/students', label: 'Students', icon: Users },
    { href: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/instructor/schedule', label: 'Schedule', icon: Calendar }
  ]
}

export function Navigation({ userRole = 'ADMIN', userName = 'John Doe' }: Readonly<NavigationProps>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const navItems = navigationItems[userRole]

  const isActive = (href: string) => {
    return pathname ? pathname === href || pathname.startsWith(href + '/') : false
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsMobileMenuOpen(false)
            }
          }}
          aria-label="Close mobile menu"
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ERP System</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    active ? "text-blue-700" : "text-gray-400"
                  )} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto text-xs bg-blue-100 text-blue-800">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase()}</p>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isProfileOpen && "rotate-180"
                )} />
              </button>

              {isProfileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => {
                      setIsProfileOpen(false)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => {
                      setIsProfileOpen(false)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
