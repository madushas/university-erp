'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  AlertCircle,
  Trash2,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useRegistrations } from '@/lib/hooks/useRegistrations';
import { RegistrationValidationUtils } from '@/lib/utils/registrationValidation';
import type { RegistrationDto } from '@/lib/types/registration';
import { NAV_ROUTES } from '@/lib/utils/constants';
import { toast } from 'sonner';

interface CurrentRegistrationsDisplayProps {
  onViewDetails?: (registration: RegistrationDto) => void;
  className?: string;
}

export function CurrentRegistrationsDisplay({
  onViewDetails,
  className = ''
}: CurrentRegistrationsDisplayProps) {
  const router = useRouter();
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDto | null>(null);
  const [showDropDialog, setShowDropDialog] = useState(false);
  const [droppingCourse, setDroppingCourse] = useState(false);

  const { 
    registrations, 
    loading, 
    error, 
    dropCourse,
    refresh 
  } = useRegistrations();

  // Filter current registrations (enrolled and pending)
  const currentRegistrations = registrations.filter(reg => 
    ['ENROLLED', 'PENDING'].includes(reg.status || '')
  );

  // Handle course drop
  const handleDropCourse = async (registration: RegistrationDto) => {
    if (!registration.course?.id) return;

    setDroppingCourse(true);
    try {
      const ok = await dropCourse(registration.course.id);
      if (ok) {
        toast.success('Course dropped successfully');
        setShowDropDialog(false);
        setSelectedRegistration(null);
        refresh();
      } else {
        toast.error('Unable to drop course');
      }
    } catch (error) {
      console.error('Failed to drop course:', error);
      const msg = error instanceof Error ? error.message : 'Failed to drop course';
      toast.error(msg);
    } finally {
      setDroppingCourse(false);
    }
  };



  // Get status badge variant
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'OVERDUE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Calculate total credits
  const totalCredits = currentRegistrations.reduce((sum, reg) => 
    sum + (reg.course?.credits || 0), 0
  );

  const getInstructorLabel = (c: RegistrationDto['course']): string => {
    if (!c) return 'TBA';
    const ext = c as unknown as { instructorName?: string; instructor?: string };
    return ext.instructorName ?? ext.instructor ?? 'TBA';
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load registrations: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Registrations
          </CardTitle>
          <CardDescription>
            Your enrolled and pending courses for this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentRegistrations.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">Active Courses</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {totalCredits}
              </div>
              <div className="text-sm text-green-600 font-medium">Total Credits</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {registrations.filter(reg => reg.status === 'ENROLLED').length}
              </div>
              <div className="text-sm text-purple-600 font-medium">Enrolled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : currentRegistrations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Registrations</h3>
              <p className="text-gray-500 mb-4">
                You are not currently registered for any courses this semester.
              </p>
              <Button onClick={() => router.push(NAV_ROUTES.REGISTRATION)}>
                Browse Available Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          currentRegistrations.map((registration) => {
            const course = registration.course;
            const canDrop = RegistrationValidationUtils.canDropCourse(registration);

            return (
              <Card key={registration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course?.code} - {course?.title}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(registration.status)}>
                          {registration.status}
                        </Badge>
                        {registration.paymentStatus && registration.paymentStatus !== 'PAID' && (
                          <Badge variant="outline" className={getPaymentStatusColor(registration.paymentStatus)}>
                            {registration.paymentStatus}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {course?.description || 'No description available'}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Instructor: {getInstructorLabel(course)}</span>
                        </div>
                        
                        {course?.schedule && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.schedule}</span>
                          </div>
                        )}
                        
                        {course?.classroom && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{course.classroom}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course?.credits} Credits</span>
                        </div>

                        {registration.registrationDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {/* Grade Display */}
                      {registration.grade && (
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${RegistrationValidationUtils.getGradeColor(registration.grade)}`}>
                            {RegistrationValidationUtils.formatGrade(registration.grade, registration.gradePoints)}
                          </div>
                          <div className="text-xs text-gray-500">Current Grade</div>
                        </div>
                      )}

                      {/* Course Fee */}
                      {course?.courseFee && course.courseFee > 0 && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${course.courseFee.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Course Fee</div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails?.(registration)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        
                        {canDrop.canDrop && (
                          <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setSelectedRegistration(registration)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Drop
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Drop Course</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to drop {course?.code} - {course?.title}?
                                  This action cannot be undone and may affect your academic progress.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Important:</strong> Dropping this course may result in:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                      <li>Loss of course fees (check refund policy)</li>
                                      <li>Impact on your academic progress</li>
                                      <li>Potential scheduling conflicts if re-enrolling</li>
                                      <li>Financial aid implications</li>
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowDropDialog(false);
                                    setSelectedRegistration(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => selectedRegistration && handleDropCourse(selectedRegistration)}
                                  disabled={droppingCourse}
                                >
                                  {droppingCourse ? 'Dropping...' : 'Drop Course'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Badge variant="outline">{course?.department}</Badge>
                    <Badge variant="outline">{course?.courseLevel}</Badge>
                    
                    {registration.paymentStatus === 'OVERDUE' && (
                      <Badge variant="destructive" className="animate-pulse">
                        Payment Overdue
                      </Badge>
                    )}
                    
                    {registration.attendancePercentage !== undefined && (
                      <Badge variant="outline">
                        {registration.attendancePercentage.toFixed(1)}% Attendance
                      </Badge>
                    )}
                  </div>

                  {/* Payment Warning */}
                  {registration.paymentStatus === 'PENDING' && (
                    <Alert className="mt-4">
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        Payment is pending for this course. Please complete payment to avoid being dropped from the course.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Overdue Payment Alert */}
                  {registration.paymentStatus === 'OVERDUE' && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Payment is overdue! You may be dropped from this course if payment is not received soon.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Academic Progress Summary */}
      {currentRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Academic Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Semester</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Credits:</span>
                    <span className="font-medium">{totalCredits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Enrolled Courses:</span>
                    <span className="font-medium">
                      {registrations.filter(reg => reg.status === 'ENROLLED').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Courses:</span>
                    <span className="font-medium">
                      {registrations.filter(reg => reg.status === 'PENDING').length}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Payment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Paid:</span>
                    <span className="font-medium text-green-600">
                      {registrations.filter(reg => reg.paymentStatus === 'PAID').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-600">
                      {registrations.filter(reg => reg.paymentStatus === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Overdue:</span>
                    <span className="font-medium text-red-600">
                      {registrations.filter(reg => reg.paymentStatus === 'OVERDUE').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}