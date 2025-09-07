'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Users, 
  Clock, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useCourses } from '@/lib/hooks/useCourses';
import { useRegistrations, useEnrollmentValidation } from '@/lib/hooks/useRegistrations';
import type { CourseDto, CourseSearchParams } from '@/lib/types/course';
import type { EnrollmentValidation } from '@/lib/types/registration';
import { toast } from 'sonner';

interface AvailableCoursesDisplayProps {
  onCourseSelect?: (course: CourseDto) => void;
  onEnrollClick?: (courseId: number) => void;
  showEnrollButton?: boolean;
  className?: string;
}

export function AvailableCoursesDisplay({
  onCourseSelect,
  onEnrollClick,
  showEnrollButton = true,
  className = ''
}: AvailableCoursesDisplayProps) {
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    status: 'ACTIVE',
    page: 0,
    size: 20,
    sortBy: 'title',
    sortDirection: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);

  const { 
    pagedCourses, 
    loading: coursesLoading, 
    error: coursesError, 
    loadPagedCourses 
  } = useCourses({ autoLoad: false });

  const { 
    registrations, 
    loading: registrationsLoading, 
    enrollInCourse 
  } = useRegistrations();

  const { 
    validation, 
    validateEnrollment 
  } = useEnrollmentValidation();

  const getInstructorLabel = (course: CourseDto): string => {
    if (!course) return 'TBA';
    if ('instructorName' in course && course.instructorName) return course.instructorName;
    // Backward compatibility for legacy field
    const legacy = (course as unknown as { instructor?: string }).instructor;
    return legacy || 'TBA';
  };

  // Load courses when search params change
  useEffect(() => {
    loadPagedCourses(searchParams);
  }, [searchParams, loadPagedCourses]);

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchParams(prev => ({
      ...prev,
      title: value || undefined,
      page: 0
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof CourseSearchParams, value: string | number | undefined) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
      page: 0
    }));
  };

  // Handle course selection
  const handleCourseSelect = (course: CourseDto) => {
    setSelectedCourse(course);
    onCourseSelect?.(course);
    
    // Validate enrollment when course is selected
    if (course.id) {
      validateEnrollment(course.id);
    }
  };

  // Handle enrollment
  const handleEnroll = async (courseId: number) => {
    try {
      const reg = await enrollInCourse(courseId);
      if (reg) {
        toast.success('Enrolled successfully');
      } else {
        toast.error('Failed to enroll in course');
      }
      // Refresh courses to update enrollment counts
      loadPagedCourses(searchParams);
    } catch (error) {
      console.error('Enrollment failed:', error);
      const msg = error instanceof Error ? error.message : 'Enrollment failed';
      toast.error(msg);
    }
    
    onEnrollClick?.(courseId);
  };

  // Check if user is already enrolled in a course
  const isEnrolled = (courseId: number) => {
    return registrations.some(reg => 
      reg.course?.id === courseId && 
      ['ENROLLED', 'PENDING'].includes(reg.status || '')
    );
  };

  // Get enrollment status for a course
  const getEnrollmentStatus = (course: CourseDto) => {
    if (!course.id) return null;
    
    const registration = registrations.find(reg => reg.course?.id === course.id);
    return registration?.status || null;
  };

  // Calculate enrollment percentage
  const getEnrollmentPercentage = (course: CourseDto) => {
    if (!course.maxStudents || course.maxStudents === 0) return 0;
    const enrolled = course.enrolledStudents || 0;
    return Math.round((enrolled / course.maxStudents) * 100);
  };

  // Get enrollment status color
  const getEnrollmentStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (coursesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load available courses: {coursesError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Available Courses
          </CardTitle>
          <CardDescription>
            Browse and enroll in available courses for the current semester
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses by title, code, or instructor..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select
              value={searchParams.department || ''}
              onValueChange={(value) => handleFilterChange('department', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.courseLevel || ''}
              onValueChange={(value) => handleFilterChange('courseLevel', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                <SelectItem value="GRADUATE">Graduate</SelectItem>
                <SelectItem value="DOCTORAL">Doctoral</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.credits?.toString() || ''}
              onValueChange={(value) => handleFilterChange('credits', value === 'ALL' ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Credits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Credits</SelectItem>
                <SelectItem value="1">1 Credit</SelectItem>
                <SelectItem value="2">2 Credits</SelectItem>
                <SelectItem value="3">3 Credits</SelectItem>
                <SelectItem value="4">4 Credits</SelectItem>
                <SelectItem value="5">5+ Credits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="space-y-4">
        {coursesLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : pagedCourses?.content?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters to find available courses.
              </p>
            </CardContent>
          </Card>
        ) : (
          pagedCourses?.content?.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course);
            const isUserEnrolled = isEnrolled(course.id || 0);
            const enrollmentPercentage = getEnrollmentPercentage(course);
            const isCourseFull = enrollmentPercentage >= 100;

            return (
              <Card 
                key={course.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.code} - {course.title}
                        </h3>
                        {isUserEnrolled && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {enrollmentStatus}
                          </Badge>
                        )}
                        {isCourseFull && !isUserEnrolled && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Full
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Instructor: {getInstructorLabel(course)}</span>
                        </div>
                        
                        {course.schedule && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.schedule}</span>
                          </div>
                        )}
                        
                        {course.classroom && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{course.classroom}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.credits} Credits</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {/* Enrollment Info */}
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getEnrollmentStatusColor(enrollmentPercentage)}`}>
                          {course.enrolledStudents || 0} / {course.maxStudents || 'Unlimited'} enrolled
                        </div>
                        {course.maxStudents && course.maxStudents > 0 && (
                          <div className="text-xs text-gray-500">
                            {enrollmentPercentage}% capacity
                          </div>
                        )}
                      </div>

                      {/* Enroll Button */}
                      {showEnrollButton && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (course.id) {
                              handleEnroll(course.id);
                            }
                          }}
                          disabled={isUserEnrolled || isCourseFull || registrationsLoading}
                          variant={isUserEnrolled ? "secondary" : "default"}
                          size="sm"
                        >
                          {registrationsLoading ? (
                            'Processing...'
                          ) : isUserEnrolled ? (
                            'Enrolled'
                          ) : isCourseFull ? (
                            'Full'
                          ) : (
                            'Enroll'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Course Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{course.department}</Badge>
                    <Badge variant="outline">{course.courseLevel}</Badge>
                    {course.prerequisites && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Prerequisites Required
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagedCourses && (pagedCourses.totalPages ?? 0) > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', Math.max(0, (searchParams.page || 0) - 1))}
            disabled={searchParams.page === 0}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {(searchParams.page || 0) + 1} of {pagedCourses.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', (searchParams.page || 0) + 1)}
            disabled={(searchParams.page || 0) >= (pagedCourses.totalPages ?? 1) - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Enrollment Validation Display */}
      {selectedCourse && validation && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentValidationDisplay validation={validation} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Component to display enrollment validation results
function EnrollmentValidationDisplay({ validation }: { validation: EnrollmentValidation }) {
  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        validation.canEnroll 
          ? 'bg-green-50 text-green-800' 
          : 'bg-red-50 text-red-800'
      }`}>
        {validation.canEnroll ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <span className="font-medium">
          {validation.canEnroll ? 'Eligible to enroll' : 'Not eligible to enroll'}
        </span>
      </div>

      {/* Reasons */}
      {validation.reasons.length > 0 && (
        <div>
          <h4 className="font-medium text-red-800 mb-2">Issues:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            {validation.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div>
          <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites */}
      {validation.prerequisites.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Prerequisites:</h4>
          <div className="space-y-2">
            {validation.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {prereq.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={prereq.completed ? 'text-green-700' : 'text-red-700'}>
                  {prereq.courseCode} - {prereq.courseName}
                  {prereq.grade && ` (Grade: ${prereq.grade})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {validation.conflicts.length > 0 && (
        <div>
          <h4 className="font-medium text-red-800 mb-2">Conflicts:</h4>
          <div className="space-y-2">
            {validation.conflicts.map((conflict, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{conflict.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}