'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  BookOpen,
  MapPin,
  Calendar
} from 'lucide-react';
import { useRegistrations, useEnrollmentValidation } from '@/lib/hooks/useRegistrations';
import { useCourse } from '@/lib/hooks/useCourses';
import type { CourseDto } from '@/lib/types/course';
import type { EnrollmentValidation } from '@/lib/types/registration';

// Form validation schema
const registrationFormSchema = z.object({
  courseId: z.number().min(1, 'Course selection is required'),
  notes: z.string().optional(),
  acknowledgements: z.object({
    prerequisitesReviewed: z.boolean().refine(val => val === true, {
      message: 'You must review and acknowledge the prerequisites'
    }),
    scheduleConflictAware: z.boolean().refine(val => val === true, {
      message: 'You must acknowledge awareness of potential schedule conflicts'
    }),
    paymentTermsAccepted: z.boolean().refine(val => val === true, {
      message: 'You must accept the payment terms and conditions'
    }),
    withdrawalPolicyUnderstood: z.boolean().refine(val => val === true, {
      message: 'You must acknowledge understanding of the withdrawal policy'
    })
  })
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface RegistrationFormProps {
  courseId?: number;
  course?: CourseDto;
  onSuccess?: (registrationId: number) => void;
  onCancel?: () => void;
  className?: string;
}

export function RegistrationForm({
  courseId,
  course: providedCourse,
  onSuccess,
  onCancel,
  className = ''
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hooks
  const { course: fetchedCourse, loading: courseLoading } = useCourse(courseId);
  const { enrollInCourse } = useRegistrations();
  const { validation, validateEnrollment, loading: validationLoading } = useEnrollmentValidation();

  // Use provided course or fetch it
  const course = providedCourse || fetchedCourse;

  // Form setup
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      courseId: courseId || 0,
      notes: '',
      acknowledgements: {
        prerequisitesReviewed: false,
        scheduleConflictAware: false,
        paymentTermsAccepted: false,
        withdrawalPolicyUnderstood: false
      }
    }
  });

  // Validate enrollment when course is loaded
  useEffect(() => {
    if (course?.id) {
      validateEnrollment(course.id);
      form.setValue('courseId', course.id);
    }
  }, [course?.id, validateEnrollment, form]);

  // Handle form submission
  const onSubmit = async () => {
    if (!course?.id) {
      setSubmitError('Course information is not available');
      return;
    }

    if (!validation?.canEnroll) {
      setSubmitError('You are not eligible to enroll in this course');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const registration = await enrollInCourse(course.id);
      if (registration?.id) {
        onSuccess?.(registration.id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (courseLoading || !course) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Registration
          </CardTitle>
          <CardDescription>
            Review course details and complete the registration process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseDetailsDisplay course={course} />
        </CardContent>
      </Card>

      {/* Enrollment Validation */}
      {validation && (
        <Card className={`border-l-4 ${
          validation.canEnroll ? 'border-l-green-500' : 'border-l-red-500'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.canEnroll ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Enrollment Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentValidationDisplay validation={validation} />
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>
            Please review and complete the following information to register for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information or special requests..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can provide any additional information relevant to your registration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Acknowledgements */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Acknowledgements</h3>
                <p className="text-sm text-gray-600">
                  Please read and acknowledge the following before proceeding with registration:
                </p>

                <FormField
                  control={form.control}
                  name="acknowledgements.prerequisitesReviewed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Prerequisites Reviewed
                        </FormLabel>
                        <FormDescription>
                          I have reviewed and understand the course prerequisites. I confirm that I have 
                          completed all required prerequisite courses with satisfactory grades.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acknowledgements.scheduleConflictAware"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Schedule Conflict Awareness
                        </FormLabel>
                        <FormDescription>
                          I understand the course schedule and confirm that I have no conflicts with 
                          other enrolled courses or commitments.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acknowledgements.paymentTermsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Payment Terms Accepted
                        </FormLabel>
                        <FormDescription>
                          I accept the payment terms and understand that course fees are due by the 
                          specified deadline. Late payments may result in course removal.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acknowledgements.withdrawalPolicyUnderstood"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Withdrawal Policy Understood
                        </FormLabel>
                        <FormDescription>
                          I understand the course withdrawal policy, including deadlines and potential 
                          financial implications of dropping the course.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Error Display */}
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !validation?.canEnroll || validationLoading}
                  className="flex-1"
                >
                  {isSubmitting ? 'Enrolling...' : 'Complete Registration'}
                </Button>
                
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to display course details
function CourseDetailsDisplay({ course }: { course: CourseDto }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {course.code} - {course.title}
        </h3>
        <p className="text-gray-600 mt-1">
          {course.description || 'No description available'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Instructor:</span>
            <span>{
              ('instructorName' in course && course.instructorName) || 
              course.instructor || 
              'TBA'
            }</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Credits:</span>
            <span>{course.credits}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Department:</span>
            <span>{course.department}</span>
          </div>
        </div>

        <div className="space-y-3">
          {course.schedule && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Schedule:</span>
              <span>{course.schedule}</span>
            </div>
          )}

          {course.classroom && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Location:</span>
              <span>{course.classroom}</span>
            </div>
          )}

          {course.courseFee && course.courseFee > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Course Fee:</span>
              <span>${course.courseFee.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Info */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Enrollment:</span>
          <span className="text-sm">
            {course.enrolledStudents || 0} / {course.maxStudents || 'Unlimited'} students
          </span>
        </div>
        
        {course.maxStudents && course.maxStudents > 0 && (
          <Badge variant="outline">
            {Math.round(((course.enrolledStudents || 0) / course.maxStudents) * 100)}% Full
          </Badge>
        )}
      </div>

      {/* Prerequisites */}
      {course.prerequisites && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Prerequisites Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {course.prerequisites}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to display enrollment validation
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
          <AlertCircle className="h-5 w-5" />
        )}
        <span className="font-medium">
          {validation.canEnroll ? 'Eligible to enroll' : 'Not eligible to enroll'}
        </span>
      </div>

      {/* Issues */}
      {validation.reasons.length > 0 && (
        <div>
          <h4 className="font-medium text-red-800 mb-2">Issues that must be resolved:</h4>
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
          <h4 className="font-medium text-yellow-800 mb-2">Important notices:</h4>
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
          <h4 className="font-medium text-gray-800 mb-2">Prerequisites status:</h4>
          <div className="space-y-2">
            {validation.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {prereq.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
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
    </div>
  );
}