'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  Users,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { AvailableCoursesDisplay } from './AvailableCoursesDisplay';
import { RegistrationForm } from './RegistrationForm';
import { RegistrationConfirmation } from './RegistrationConfirmation';
import { useRegistrations } from '@/lib/hooks/useRegistrations';
import type { CourseDto } from '@/lib/types/course';
import type { RegistrationDto } from '@/lib/types/registration';

type RegistrationStep = 'browse' | 'register' | 'confirmation';

interface CourseRegistrationInterfaceProps {
  className?: string;
}

export function CourseRegistrationInterface({ className = '' }: CourseRegistrationInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('browse');
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [completedRegistration, setCompletedRegistration] = useState<RegistrationDto | null>(null);

  const { registrations } = useRegistrations();

  // Handle course selection from browse view
  const handleCourseSelect = (course: CourseDto) => {
    setSelectedCourse(course);
  };

  // Handle enrollment button click from browse view
  const handleEnrollClick = (courseId: number) => {
    const course = selectedCourse || { id: courseId } as CourseDto;
    setSelectedCourse(course);
    setCurrentStep('register');
  };

  // Handle successful registration
  const handleRegistrationSuccess = (registrationId: number) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (registration) {
      setCompletedRegistration(registration);
      setCurrentStep('confirmation');
    }
  };

  // Handle registration cancellation
  const handleRegistrationCancel = () => {
    setCurrentStep('browse');
    setSelectedCourse(null);
  };

  // Handle back to browse from confirmation
  const handleBackToBrowse = () => {
    setCurrentStep('browse');
    setSelectedCourse(null);
    setCompletedRegistration(null);
  };

  // Get current enrollments count
  const currentEnrollments = registrations.filter(reg => 
    ['ENROLLED', 'PENDING'].includes(reg.status || '')
  ).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Registration</h1>
          <p className="text-gray-600 mt-1">
            Browse available courses and manage your registrations
          </p>
        </div>
        
        {currentEnrollments > 0 && (
          <Badge variant="secondary" className="text-sm">
            <Users className="h-4 w-4 mr-1" />
            {currentEnrollments} Active Registration{currentEnrollments !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center gap-2 ${
                currentStep === 'browse' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'browse' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  1
                </div>
                <span className="font-medium">Browse Courses</span>
              </div>

              <div className="w-8 h-px bg-gray-300"></div>

              <div className={`flex items-center gap-2 ${
                currentStep === 'register' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'register' 
                    ? 'bg-blue-100 text-blue-600' 
                    : currentStep === 'confirmation'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep === 'confirmation' ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="font-medium">Register</span>
              </div>

              <div className="w-8 h-px bg-gray-300"></div>

              <div className={`flex items-center gap-2 ${
                currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'confirmation' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep === 'confirmation' ? <CheckCircle className="h-4 w-4" /> : '3'}
                </div>
                <span className="font-medium">Confirmation</span>
              </div>
            </div>

            {/* Back Button */}
            {currentStep !== 'browse' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentStep === 'register') {
                    handleRegistrationCancel();
                  } else {
                    handleBackToBrowse();
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Period Alert */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <strong>Registration Period:</strong> Course registration for Spring 2025 is now open. 
          Registration closes on January 31, 2025. Early registration is recommended as courses 
          may fill up quickly.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {currentStep === 'browse' && (
          <AvailableCoursesDisplay
            onCourseSelect={handleCourseSelect}
            onEnrollClick={handleEnrollClick}
            showEnrollButton={true}
          />
        )}

        {currentStep === 'register' && selectedCourse && (
          <RegistrationForm
            courseId={selectedCourse.id}
            course={selectedCourse}
            onSuccess={handleRegistrationSuccess}
            onCancel={handleRegistrationCancel}
          />
        )}

        {currentStep === 'confirmation' && completedRegistration && (
          <RegistrationConfirmation
            registration={completedRegistration}
            onViewRegistrations={handleBackToBrowse}
            onDownloadConfirmation={() => {
              // Implement download functionality
              console.log('Download confirmation for registration:', completedRegistration.id);
            }}
          />
        )}
      </div>

      {/* Quick Stats */}
      {currentStep === 'browse' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Summary</CardTitle>
            <CardDescription>
              Your current registration status for this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {registrations.filter(reg => reg.status === 'ENROLLED').length}
                </div>
                <div className="text-sm text-blue-600 font-medium">Enrolled</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {registrations.filter(reg => reg.status === 'PENDING').length}
                </div>
                <div className="text-sm text-yellow-600 font-medium">Pending</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {registrations.filter(reg => reg.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-green-600 font-medium">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {registrations.reduce((sum, reg) => sum + (reg.course?.credits || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Credits</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Registration Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Registration Tips</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Check prerequisites before registering</li>
                <li>• Register early for popular courses</li>
                <li>• Verify your schedule for conflicts</li>
                <li>• Complete payment by the deadline</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Need Assistance?</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Academic Advising:</span>
                  <span className="text-blue-600 ml-2">advising@university.edu</span>
                </div>
                <div>
                  <span className="font-medium">Registration Support:</span>
                  <span className="text-blue-600 ml-2">registrar@university.edu</span>
                </div>
                <div>
                  <span className="font-medium">Technical Support:</span>
                  <span className="text-blue-600 ml-2">support@university.edu</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}