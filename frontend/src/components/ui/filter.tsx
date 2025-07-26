import React from 'react'
import { Input } from './input'
import { Button } from './button'
import { Badge } from './badge'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (order: 'asc' | 'desc') => void
  onClearFilters: () => void
  totalResults: number
}

export const Filter: React.FC<FilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  totalResults
}) => {
  const hasFilters = searchTerm || statusFilter || sortBy !== 'registrationDate'

  return (
    <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search and Status Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search students by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Sort by"
            >
              <option value="registrationDate">Registration Date</option>
              <option value="lastName">Last Name</option>
              <option value="firstName">First Name</option>
              <option value="status">Status</option>
              <option value="grade">Grade</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
              >
                <XMarkIcon className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results Count and Active Filters */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {totalResults} {totalResults === 1 ? 'student' : 'students'} found
          </span>
          
          <div className="flex items-center space-x-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchTerm}
                <XMarkIcon 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <XMarkIcon 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onStatusChange('')}
                />
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
