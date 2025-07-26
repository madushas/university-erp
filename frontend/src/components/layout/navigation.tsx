'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CogIcon,
  ArrowRightCircleIcon 
} from '@heroicons/react/24/outline'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Courses', href: '/courses', icon: AcademicCapIcon },
  { label: 'Registrations', href: '/registrations', icon: DocumentTextIcon },
  { label: 'Analytics', href: '/analytics', icon: ChartBarIcon, adminOnly: true },
  { label: 'Departments', href: '/admin/departments', icon: UserGroupIcon, adminOnly: true },
  { label: 'Users', href: '/admin/users', icon: UserGroupIcon, adminOnly: true },
  { label: 'Admin', href: '/admin', icon: CogIcon, adminOnly: true },
]

export default function Navigation() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user?.role === 'ADMIN'

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ERP System</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {session.user?.name || session.user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <ArrowRightCircleIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (simplified) */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
