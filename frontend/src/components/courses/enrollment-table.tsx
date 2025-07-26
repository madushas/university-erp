import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Filter } from '../ui/filter'
import { Pagination } from '../ui/pagination'
import { LoadingSpinner } from '../ui/loading-spinner'
import { 
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  UserGroupIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Registration } from '@/types'

interface EnrollmentTableProps {
  registrations: Registration[]
  loading: boolean
  onConfirmEnrollment: (id: number) => void
  onRejectEnrollment: (id: number) => void
  onUpdateGrade: (id: number, grade: string) => void
  onUnenrollStudent: (id: number) => void
}

export const EnrollmentTable: React.FC<EnrollmentTableProps> = ({
  registrations,
  loading,
  onConfirmEnrollment,
  onRejectEnrollment,
  onUpdateGrade,
  onUnenrollStudent
}) => {
  const [editingGrade, setEditingGrade] = useState<{ id: number; grade: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('registrationDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'DROPPED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpdateGrade = (registrationId: number, grade: string) => {
    onUpdateGrade(registrationId, grade)
    setEditingGrade(null)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setSortBy('registrationDate')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  // Filter and sort registrations
  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = searchTerm === '' || 
      registration.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || registration.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'firstName':
        aValue = a.user.firstName
        bValue = b.user.firstName
        break
      case 'lastName':
        aValue = a.user.lastName
        bValue = b.user.lastName
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'grade':
        aValue = a.grade || ''
        bValue = b.grade || ''
        break
      case 'registrationDate':
      default:
        aValue = new Date(a.registrationDate)
        bValue = new Date(b.registrationDate)
        break
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedRegistrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRegistrations = sortedRegistrations.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5" />
            <span>Enrolled Students</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserGroupIcon className="h-5 w-5" />
          <span>Enrolled Students</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Filter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={handleClearFilters}
          totalResults={sortedRegistrations.length}
        />

        {paginatedRegistrations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchTerm || statusFilter ? 'No students match your filters' : 'No students enrolled yet'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.user.firstName} {registration.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {registration.user.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(registration.status)}>
                          {registration.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(registration.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingGrade?.id === registration.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingGrade.grade}
                              onChange={(e) => setEditingGrade({...editingGrade, grade: e.target.value})}
                              className="w-20"
                              placeholder="A+"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateGrade(registration.id, editingGrade.grade)}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGrade(null)}
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{registration.grade || 'Not graded'}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingGrade({id: registration.id, grade: registration.grade || ''})}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {registration.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => onConfirmEnrollment(registration.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRejectEnrollment(registration.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(registration.status === 'ENROLLED' || registration.status === 'COMPLETED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUnenrollStudent(registration.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={sortedRegistrations.length}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
