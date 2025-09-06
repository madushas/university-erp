'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertCircle,
  Plus,
  History,
  GraduationCap,
  Clock,
  DollarSign,
  Target
} from 'lucide-react';
import { CurrentRegistrationsDisplay } from './CurrentRegistrationsDisplay';
import { RegistrationHistory } from './RegistrationHistory';
import { useRegistrations, useStudentAcademicRecord } from '@/lib/hooks/useRegistrations';
import { RegistrationValidationUtils } from '@/lib/utils/registrationValidation';
import type { RegistrationDto } from '@/lib/types/registration';
import { NAV_ROUTES } from '@/lib/utils/constants';

interface StudentRegistrationDashboardProps {
  className?: string;
}

export function StudentRegistrationDashboard({ className = '' }: StudentRegistrationDashboardProps) {
  const router = useRouter();
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDto | null>(null);
  const [showRegistrationDetails, setShowRegistrationDetails] = useState(false);

  const { 
    registrations, 
    error
  } = useRegistrations();

  const { 
    academicRecord, 
    loading: academicLoading 
  } = useStudentAcademicRecord();

  // Handle registration details view
  const handleViewRegistrationDetails = (registration: RegistrationDto) => {
    setSelectedRegistration(registration);
    setShowRegistrationDetails(true);
  };

  // Calculate quick stats
  const quickStats = {
    currentEnrollments: registrations.filter(reg => 
      ['ENROLLED', 'PENDING'].includes(reg.status || '')
    ).length,
    completedCourses: registrations.filter(reg => reg.status === 'COMPLETED').length,
    totalCredits: registrations.reduce((sum, reg) => sum + (reg.course?.credits || 0), 0),
    currentGPA: academicRecord?.gpa || 0,
    pendingPayments: registrations.filter(reg => 
      ['PENDING', 'OVERDUE'].includes(reg.paymentStatus || '')
    ).length
  };

  // Get upcoming deadlines (mock data - would come from backend)
  const upcomingDeadlines = [
    {
      type: 'Payment Due',
      course: 'CS101',
      date: '2025-02-15',
      priority: 'high' as const
    },
    {
      type: 'Drop Deadline',
      course: 'MATH201',
      date: '2025-02-20',
      priority: 'medium' as const
    },
    {
      type: 'Add/Drop Period Ends',
      course: 'All Courses',
      date: '2025-02-25',
      priority: 'low' as const
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Show error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load registration data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your course registrations and track academic progress
          </p>
        </div>
        
        <Button onClick={() => router.push(NAV_ROUTES.REGISTRATION)}>
          <Plus className="h-4 w-4 mr-2" />
          Register for Courses
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {quickStats.currentEnrollments}
            </div>
            <div className="text-sm text-blue-600 font-medium">Current Enrollments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {quickStats.completedCourses}
            </div>
            <div className="text-sm text-green-600 font-medium">Completed Courses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {quickStats.totalCredits}
            </div>
            <div className="text-sm text-purple-600 font-medium">Total Credits</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {quickStats.currentGPA.toFixed(2)}
            </div>
            <div className="text-sm text-orange-600 font-medium">Current GPA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${
              quickStats.pendingPayments > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {quickStats.pendingPayments}
            </div>
            <div className={`text-sm font-medium ${
              quickStats.pendingPayments > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              Pending Payments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="space-y-4">
        {/* Payment Alerts */}
        {quickStats.pendingPayments > 0 && (
          <Alert variant="destructive">
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Required:</strong> You have {quickStats.pendingPayments} course{quickStats.pendingPayments !== 1 ? 's' : ''} with pending payments. 
              Please complete payment to avoid being dropped from your courses.
            </AlertDescription>
          </Alert>
        )}

        {/* Registration Period Alert */}
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Registration Period:</strong> Spring 2025 add/drop period ends February 25, 2025. 
            Make sure to finalize your course schedule before the deadline.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Current Registrations
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Registration History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <CurrentRegistrationsDisplay 
                onViewDetails={handleViewRegistrationDetails}
              />
            </TabsContent>

            <TabsContent value="history">
              <RegistrationHistory 
                onViewDetails={handleViewRegistrationDetails}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Academic Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {academicLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : academicRecord ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Cumulative GPA:</span>
                    <span className="font-semibold">{academicRecord.gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Credits:</span>
                    <span className="font-semibold">{academicRecord.totalCredits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Academic Standing:</span>
                    <Badge variant="outline" className="text-xs">
                      {academicRecord.academicStanding}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Degree Progress</span>
                      <span>75%</span> {/* Mock progress */}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No academic record available</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getPriorityColor(deadline.priority)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{deadline.type}</div>
                      <div className="text-xs opacity-75">{deadline.course}</div>
                    </div>
                    <div className="text-xs font-medium">
                      {new Date(deadline.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(NAV_ROUTES.REGISTRATION)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Register for New Course
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(NAV_ROUTES.ACADEMIC_RECORDS)}
              >
                <Award className="h-4 w-4 mr-2" />
                View Academic Records
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(NAV_ROUTES.DEGREE_AUDIT)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Degree Audit
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(NAV_ROUTES.PAYMENTS)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Academic Advising</div>
                <div className="text-gray-600">Course planning and requirements</div>
                <div className="text-blue-600">advising@university.edu</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-900">Registration Support</div>
                <div className="text-gray-600">Technical registration issues</div>
                <div className="text-blue-600">registrar@university.edu</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-900">Financial Aid</div>
                <div className="text-gray-600">Payment and financial questions</div>
                <div className="text-blue-600">finaid@university.edu</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Details Modal */}
      <Dialog open={showRegistrationDetails} onOpenChange={setShowRegistrationDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Detailed information about your course registration
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <RegistrationDetailsModal registration={selectedRegistration} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Registration Details Modal Component
interface RegistrationDetailsModalProps {
  registration: RegistrationDto;
}

function RegistrationDetailsModal({ registration }: RegistrationDetailsModalProps) {
  const course = registration.course;

  return (
    <div className="space-y-6">
      {/* Course Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {course?.code} - {course?.title}
            </h4>
            <p className="text-gray-600 text-sm mt-1">
              {course?.description || 'No description available'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Instructor:</span>
              <span className="ml-2">{course?.instructor}</span>
            </div>
            <div>
              <span className="font-medium">Credits:</span>
              <span className="ml-2">{course?.credits}</span>
            </div>
            <div>
              <span className="font-medium">Department:</span>
              <span className="ml-2">{course?.department}</span>
            </div>
            <div>
              <span className="font-medium">Level:</span>
              <span className="ml-2">{course?.courseLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Registration ID:</span>
            <span className="ml-2 font-mono">REG-{registration.id?.toString().padStart(6, '0')}</span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <Badge className={`ml-2 ${RegistrationValidationUtils.getStatusColor(registration.status)}`}>
              {registration.status}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Registration Date:</span>
            <span className="ml-2">
              {registration.registrationDate 
                ? new Date(registration.registrationDate).toLocaleDateString()
                : 'N/A'
              }
            </span>
          </div>
          <div>
            <span className="font-medium">Payment Status:</span>
            <Badge variant="outline" className="ml-2">
              {registration.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      {(registration.grade || registration.attendancePercentage) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {registration.grade && (
              <div>
                <span className="font-medium">Grade:</span>
                <span className={`ml-2 font-semibold ${RegistrationValidationUtils.getGradeColor(registration.grade)}`}>
                  {RegistrationValidationUtils.formatGrade(registration.grade, registration.gradePoints)}
                </span>
              </div>
            )}
            {registration.attendancePercentage !== undefined && (
              <div>
                <span className="font-medium">Attendance:</span>
                <span className="ml-2">{registration.attendancePercentage.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {registration.notes && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">{registration.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}