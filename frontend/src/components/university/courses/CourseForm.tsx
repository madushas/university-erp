'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { CourseDto, CourseRequest, CourseFormData, CourseLevel, CourseStatus } from '@/lib/types/course';

interface CourseFormProps {
  course?: CourseDto;
  onSubmit: (courseData: CourseRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

const COURSE_LEVELS = [
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'DOCTORAL', label: 'Doctoral' },
  { value: 'CERTIFICATE', label: 'Certificate' },
];

const COURSE_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export default function CourseForm({ 
  course, 
  onSubmit, 
  onCancel, 
  loading = false, 
  mode 
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
    title: '',
    description: '',
    instructor: '',
    instructorEmail: '',
    department: '',
    courseLevel: 'UNDERGRADUATE',
    schedule: '',
    classroom: '',
    startDate: '',
    endDate: '',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 30 },
    daysOfWeek: '',
    credits: 3,
    maxStudents: 30,
    minStudents: 5,
    courseFee: 0,
    prerequisites: '',
    status: 'DRAFT',
    syllabusUrl: '',
    textbook: '',
    passingGrade: 'C',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Initialize form with course data if editing
  useEffect(() => {
    if (course && mode === 'edit') {
      setFormData({
        code: course.code || '',
        title: course.title || '',
        description: course.description || '',
        instructor: course.instructor || '',
        instructorEmail: course.instructorEmail || '',
        department: course.department || '',
        courseLevel: (course.courseLevel as CourseLevel) || 'UNDERGRADUATE',
        schedule: course.schedule || '',
        classroom: course.classroom || '',
        startDate: course.startDate || '',
        endDate: course.endDate || '',
        startTime: course.startTime ? {
          hour: course.startTime.hour || 9,
          minute: course.startTime.minute || 0
        } : { hour: 9, minute: 0 },
        endTime: course.endTime ? {
          hour: course.endTime.hour || 10,
          minute: course.endTime.minute || 30
        } : { hour: 10, minute: 30 },
        daysOfWeek: course.daysOfWeek || '',
        credits: course.credits || 3,
        maxStudents: course.maxStudents || 30,
        minStudents: course.minStudents || 5,
        courseFee: course.courseFee || 0,
        prerequisites: course.prerequisites || '',
        status: course.status || 'DRAFT',
        syllabusUrl: course.syllabusUrl || '',
        textbook: course.textbook || '',
        passingGrade: course.passingGrade || 'C',
      });

      // Parse days of week
      if (course.daysOfWeek) {
        setSelectedDays(course.daysOfWeek.split(',').map(day => day.trim()));
      }
    }
  }, [course, mode]);

  const handleInputChange = <T extends keyof CourseFormData>(field: T, value: CourseFormData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeChange = (timeType: 'startTime' | 'endTime', field: 'hour' | 'minute', value: number) => {
    setFormData(prev => ({
      ...prev,
      [timeType]: {
        ...prev[timeType],
        [field]: value
      }
    }));
  };

  const handleDayToggle = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    setFormData(prev => ({
      ...prev,
      daysOfWeek: newSelectedDays.join(', ')
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Instructor is required';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Schedule is required';
    }

    if (formData.credits < 1) {
      newErrors.credits = 'Credits must be at least 1';
    }

    if (formData.maxStudents && formData.maxStudents < 1) {
      newErrors.maxStudents = 'Maximum students must be at least 1';
    }

    if (formData.minStudents && formData.minStudents < 1) {
      newErrors.minStudents = 'Minimum students must be at least 1';
    }

    if (formData.maxStudents && formData.minStudents && 
        formData.minStudents > formData.maxStudents) {
      newErrors.minStudents = 'Minimum students cannot exceed maximum students';
    }

    if (formData.instructorEmail && !isValidEmail(formData.instructorEmail)) {
      newErrors.instructorEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Transform form data to match backend expectations
      // Backend expects time fields as strings in "HH:mm:ss" format
      const formatTime = (time: { hour: number; minute: number } | undefined): string | undefined => {
        if (!time) return undefined;
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}:00`;
      };

      const courseRequest: CourseRequest = {
        code: formData.code,
        title: formData.title,
        description: formData.description || '',
        instructor: formData.instructor,
        instructorEmail: formData.instructorEmail || '',
        department: formData.department || '',
        courseLevel: formData.courseLevel,
        schedule: formData.schedule,
        classroom: formData.classroom || '',
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),
        daysOfWeek: formData.daysOfWeek || '',
        credits: formData.credits,
        maxStudents: formData.maxStudents || 30,
        minStudents: formData.minStudents || 5,
        courseFee: formData.courseFee || 0,
        prerequisites: formData.prerequisites || '',
        status: formData.status,
        syllabusUrl: formData.syllabusUrl || '',
        textbook: formData.textbook || '',
        passingGrade: formData.passingGrade || 'C'
      };

      await onSubmit(courseRequest);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create New Course' : 'Edit Course'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'create' 
            ? 'Fill in the details to create a new course' 
            : 'Update the course information below'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code *
            </label>
            <Input
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="e.g., CS101"
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Introduction to Computer Science"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Course description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Instructor Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor *
            </label>
            <Input
              value={formData.instructor}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
              placeholder="Instructor name"
              className={errors.instructor ? 'border-red-500' : ''}
            />
            {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor Email
            </label>
            <Input
              type="email"
              value={formData.instructorEmail}
              onChange={(e) => handleInputChange('instructorEmail', e.target.value)}
              placeholder="instructor@university.com"
              className={errors.instructorEmail ? 'border-red-500' : ''}
            />
            {errors.instructorEmail && <p className="text-red-500 text-sm mt-1">{errors.instructorEmail}</p>}
          </div>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Input
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Department name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Level
            </label>
            <select
              value={formData.courseLevel}
              onChange={(e) => handleInputChange('courseLevel', e.target.value as CourseLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COURSE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits *
            </label>
            <Input
              type="number"
              min="1"
              max="12"
              value={formData.credits}
              onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 0)}
              className={errors.credits ? 'border-red-500' : ''}
            />
            {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits}</p>}
          </div>
        </div>

        {/* Schedule Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule *
            </label>
            <Input
              value={formData.schedule}
              onChange={(e) => handleInputChange('schedule', e.target.value)}
              placeholder="e.g., MWF 9:00-10:30"
              className={errors.schedule ? 'border-red-500' : ''}
            />
            {errors.schedule && <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classroom
            </label>
            <Input
              value={formData.classroom}
              onChange={(e) => handleInputChange('classroom', e.target.value)}
              placeholder="e.g., Room 101"
            />
          </div>
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days of Week
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedDays.includes(day.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={formData.startTime?.hour || 9}
                onChange={(e) => handleTimeChange('startTime', 'hour', parseInt(e.target.value) || 0)}
                placeholder="Hour"
                className="w-20"
              />
              <span className="self-center">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                step="15"
                value={formData.startTime?.minute || 0}
                onChange={(e) => handleTimeChange('startTime', 'minute', parseInt(e.target.value) || 0)}
                placeholder="Min"
                className="w-20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={formData.endTime?.hour || 10}
                onChange={(e) => handleTimeChange('endTime', 'hour', parseInt(e.target.value) || 0)}
                placeholder="Hour"
                className="w-20"
              />
              <span className="self-center">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                step="15"
                value={formData.endTime?.minute || 30}
                onChange={(e) => handleTimeChange('endTime', 'minute', parseInt(e.target.value) || 0)}
                placeholder="Min"
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Enrollment Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Students
            </label>
            <Input
              type="number"
              min="1"
              value={formData.maxStudents}
              onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
              className={errors.maxStudents ? 'border-red-500' : ''}
            />
            {errors.maxStudents && <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Students
            </label>
            <Input
              type="number"
              min="1"
              value={formData.minStudents}
              onChange={(e) => handleInputChange('minStudents', parseInt(e.target.value) || 0)}
              className={errors.minStudents ? 'border-red-500' : ''}
            />
            {errors.minStudents && <p className="text-red-500 text-sm mt-1">{errors.minStudents}</p>}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Fee
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.courseFee}
              onChange={(e) => handleInputChange('courseFee', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Grade
            </label>
            <Input
              value={formData.passingGrade}
              onChange={(e) => handleInputChange('passingGrade', e.target.value)}
              placeholder="C"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prerequisites
          </label>
          <Input
            value={formData.prerequisites}
            onChange={(e) => handleInputChange('prerequisites', e.target.value)}
            placeholder="e.g., MATH101, CS100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Syllabus URL
            </label>
            <Input
              type="url"
              value={formData.syllabusUrl}
              onChange={(e) => handleInputChange('syllabusUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as CourseStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COURSE_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Textbook
          </label>
          <Input
            value={formData.textbook}
            onChange={(e) => handleInputChange('textbook', e.target.value)}
            placeholder="Required textbook information"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </div>
            ) : (
              mode === 'create' ? 'Create Course' : 'Update Course'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}