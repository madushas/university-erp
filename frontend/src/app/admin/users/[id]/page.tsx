'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { adminApi } from '@/services/api-service'
import { User } from '@/types'
import { useToast } from '@/components/ui/toast-provider'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Role-based access control
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    if (params.id) {
      fetchUserDetails()
    }
  }, [params.id, session, router])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const userData = await adminApi.getUserById(Number(params.id))
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      showError('Error', 'Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user) return
    
    if (!confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
      return
    }

    try {
      await adminApi.deleteUser(user.id)
      success('Success', 'User deleted successfully')
      router.push('/admin/users')
    } catch (error) {
      console.error('Failed to delete user:', error)
      showError('Error', 'Failed to delete user')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800'
      case 'STUDENT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
        <Button onClick={() => router.push('/admin/users')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/users')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Users</span>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit User
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteUser}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>
      </div>

      {/* User Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-6 w-6 text-blue-600" />
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </CardTitle>
              <p className="text-gray-600 mt-1">@{user.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              
              {user.role === 'STUDENT' && user.studentId && (
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="font-semibold">{user.studentId}</p>
                  </div>
                </div>
              )}
              
              {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && user.employeeId && (
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="font-semibold">{user.employeeId}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <Badge variant="default">
                  Active
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="font-semibold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="font-semibold">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
