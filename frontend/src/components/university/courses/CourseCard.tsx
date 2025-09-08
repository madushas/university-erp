'use client';

import { useState } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CourseDto } from '@/lib/types/course';

interface CourseCardProps {
  course: CourseDto;
  viewMode: 'grid' | 'list';
  canManage: boolean;
  isStudent: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect?: () => void;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  onDrop?: () => void;
  actionLoading?: boolean;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PUBLISHED':
      return 'bg-blue-100 text-blue-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    case 'ARCHIVED':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getEnrollmentStatus = (enrolled: number = 0, max: number = 0) => {
  if (max === 0) return { text: 'No limit', color: 'text-gray-600' };
  
  const percentage = (enrolled / max) * 100;
  
  if (percentage >= 100) {
    return { text: 'Full', color: 'text-red-600' };
  } else if (percentage >= 80) {
    return { text: 'Almost full', color: 'text-orange-600' };
  } else if (percentage >= 50) {
    return { text: 'Half full', color: 'text-yellow-600' };
  } else {
    return { text: 'Available', color: 'text-green-600' };
  }
};

// Prefer instructorName with fallback to legacy instructor field
const getInstructorLabel = (c: CourseDto): string => {
  const ext = c as unknown as { instructorName?: string; instructor?: string };
  return ext.instructorName ?? ext.instructor ?? 'TBA';
};

export default function CourseCard({
  course,
  viewMode,
  canManage,
  isStudent,
  onEdit,
  onDelete,
  onSelect,
  isEnrolled = false,
  onEnroll,
  onDrop,
  actionLoading = false
}: CourseCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const enrollmentStatus = getEnrollmentStatus(course.enrolledStudents, course.maxStudents);

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            {/* Course Code & Title */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{course.code}</h3>
                <Badge className={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-medium">{course.title}</p>
            </div>

            {/* Instructor */}
            <div>
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="text-sm font-medium text-gray-900">
                {getInstructorLabel(course)}
              </p>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="text-sm font-medium text-gray-900">
                {course.schedule || 'TBA'}
              </p>
            </div>

            {/* Credits */}
            <div>
              <p className="text-sm text-gray-500">Credits</p>
              <p className="text-sm font-medium text-gray-900">{course.credits}</p>
            </div>

            {/* Enrollment */}
            <div>
              <p className="text-sm text-gray-500">Enrollment</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {course.enrolledStudents || 0}/{course.maxStudents || 0}
                </p>
                <span className={`text-xs ${enrollmentStatus.color}`}>
                  {enrollmentStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
            
            {isStudent && course.status === 'ACTIVE' && (
              isEnrolled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDrop?.();
                  }}
                  disabled={actionLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {actionLoading ? 'Dropping...' : 'Drop'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={actionLoading || (course.enrolledStudents ?? 0) >= (course.maxStudents ?? 0)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnroll?.();
                  }}
                >
                  {actionLoading
                    ? 'Registering...'
                    : (course.enrolledStudents ?? 0) >= (course.maxStudents ?? 0) ? 'Full' : 'Register'}
                </Button>
              )
            )}
            
            {canManage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{course.description || 'No description available'}</p>
              </div>
              <div className="space-y-2">
                {course.department && (
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 text-gray-900">{course.department}</span>
                  </div>
                )}
                {course.classroom && (
                  <div>
                    <span className="text-gray-500">Classroom:</span>
                    <span className="ml-2 text-gray-900">{course.classroom}</span>
                  </div>
                )}
                {course.prerequisites && (
                  <div>
                    <span className="text-gray-500">Prerequisites:</span>
                    <span className="ml-2 text-gray-900">{course.prerequisites}</span>
                  </div>
                )}
                {course.courseFee && course.courseFee > 0 && (
                  <div>
                    <span className="text-gray-500">Course Fee:</span>
                    <span className="ml-2 text-gray-900">${course.courseFee}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
          <Badge className={getStatusColor(course.status)}>
            {course.status}
          </Badge>
        </div>
        
        {course.courseFee && course.courseFee > 0 && (
          <span className="text-sm font-medium text-green-600">
            ${course.courseFee}
          </span>
        )}
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-2 line-clamp-2">
        {course.title}
      </h4>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {course.description || 'No description available'}
      </p>
      
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Instructor:</span>
          <span className="text-gray-900">{getInstructorLabel(course)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Credits:</span>
          <span className="text-gray-900">{course.credits}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Schedule:</span>
          <span className="text-gray-900">{course.schedule || 'TBA'}</span>
        </div>
        {course.classroom && (
          <div className="flex justify-between">
            <span className="font-medium">Room:</span>
            <span className="text-gray-900">{course.classroom}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-medium">Enrollment:</span>
          <div className="text-right">
            <span className="text-gray-900">
              {course.enrolledStudents || 0}/{course.maxStudents || 0}
            </span>
            <div className={`text-xs ${enrollmentStatus.color}`}>
              {enrollmentStatus.text}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for Enrollment */}
      {course.maxStudents && course.maxStudents > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((course.enrolledStudents || 0) / course.maxStudents) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {course.prerequisites && (
        <div className="mb-4 p-2 bg-yellow-50 rounded-md">
          <p className="text-xs text-yellow-800">
            <span className="font-medium">Prerequisites:</span> {course.prerequisites}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isStudent && course.status === 'ACTIVE' && (
          isEnrolled ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={actionLoading}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDrop?.();
              }}
            >
              {actionLoading ? 'Dropping...' : 'Drop'}
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={actionLoading || (course.enrolledStudents ?? 0) >= (course.maxStudents ?? 0)}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEnroll?.();
              }}
            >
              {actionLoading
                ? 'Registering...'
                : (course.enrolledStudents ?? 0) >= (course.maxStudents ?? 0) ? 'Full' : 'Register'}
            </Button>
          )
        )}

        {canManage && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </>
        )}

        {!isStudent && !canManage && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
}