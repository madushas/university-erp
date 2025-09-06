'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  DollarSign,
  FileText,
  Mail,
  Download,
  ArrowRight
} from 'lucide-react';
import type { RegistrationDto } from '@/lib/types/registration';

interface RegistrationConfirmationProps {
  registration: RegistrationDto;
  onViewRegistrations?: () => void;
  onDownloadConfirmation?: () => void;
  className?: string;
}

export function RegistrationConfirmation({
  registration,
  onViewRegistrations,
  onDownloadConfirmation,
  className = ''
}: RegistrationConfirmationProps) {
  const course = registration.course;
  const student = registration.user;

  const getInstructorLabel = (c: typeof registration.course): string => {
    if (!c) return 'TBA';
    const ext = c as unknown as { instructorName?: string; instructor?: string };
    return ext.instructorName ?? ext.instructor ?? 'TBA';
  };

  // Format registration date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'WAITLISTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">
                Registration Successful!
              </h2>
              <p className="text-green-700 mt-1">
                You have been successfully registered for {course?.code} - {course?.title}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registration Details
          </CardTitle>
          <CardDescription>
            Your registration information and confirmation details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registration Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Registration ID
                </h3>
                <p className="text-lg font-mono text-gray-900 mt-1">
                  REG-{registration.id?.toString().padStart(6, '0')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Registration Date
                </h3>
                <p className="text-lg text-gray-900 mt-1">
                  {formatDate(registration.registrationDate)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </h3>
                <Badge className={`mt-1 ${getStatusColor(registration.status)}`}>
                  {registration.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Student Information
                </h3>
                <p className="text-lg text-gray-900 mt-1">
                  {student?.firstName} {student?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Student ID: {student?.studentId}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {student?.email}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Payment Status
                </h3>
                <Badge className={`mt-1 ${getPaymentStatusColor(registration.paymentStatus)}`}>
                  {registration.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {course?.code} - {course?.title}
                </h4>
                <p className="text-gray-600 mt-1">
                  {course?.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Instructor:</span>
                    <span>{getInstructorLabel(course)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Credits:</span>
                    <span>{course?.credits}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Department:</span>
                    <span>{course?.department}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {course?.schedule && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Schedule:</span>
                      <span>{course.schedule}</span>
                    </div>
                  )}

                  {course?.classroom && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Location:</span>
                      <span>{course.classroom}</span>
                    </div>
                  )}

                  {course?.courseFee && course.courseFee > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Course Fee:</span>
                      <span>${course.courseFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Information */}
          {registration.paymentStatus === 'PENDING' && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment Required:</strong> Your registration is pending payment. 
                Please complete your payment by the deadline to secure your enrollment.
                {course?.courseFee && course.courseFee > 0 && (
                  <span> Amount due: ${course.courseFee.toFixed(2)}</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Check your email for a detailed confirmation message</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Add the course schedule to your calendar</span>
              </li>
              {registration.paymentStatus === 'PENDING' && (
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Complete payment to finalize your enrollment</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Access course materials through the student portal</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Contact your instructor if you have any questions</span>
              </li>
            </ul>
          </div>

          {/* Withdrawal Policy Reminder */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Withdrawal Policy Reminder:</h4>
            <p className="text-sm text-yellow-800">
              Remember that there are specific deadlines for dropping courses without penalty. 
              Please review the academic calendar and withdrawal policy for important dates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onViewRegistrations}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Registrations
            </Button>

            <Button
              variant="outline"
              onClick={onDownloadConfirmation}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Confirmation
            </Button>

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Print Confirmation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Academic Advising</h4>
              <p className="text-gray-600">
                For questions about course requirements, prerequisites, or academic planning.
              </p>
              <p className="text-blue-600 mt-1">advising@university.edu</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Registration Support</h4>
              <p className="text-gray-600">
                For technical issues with registration or payment problems.
              </p>
              <p className="text-blue-600 mt-1">registrar@university.edu</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}