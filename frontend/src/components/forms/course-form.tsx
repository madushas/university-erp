'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCourseStore } from '@/store/course-store'
import { Course } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Course title is required'),
  description: z.string().min(1, 'Course description is required'),
  credits: z.number().min(1, 'Credits must be at least 1').max(10, 'Credits cannot exceed 10'),
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
  instructor: z.string().min(1, 'Instructor name is required'),
  schedule: z.string().min(1, 'Schedule is required'),
})

type CourseFormData = z.infer<typeof courseSchema>

interface CourseFormProps {
  course?: Course // For edit mode
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CourseForm({ course, onSuccess, onCancel }: Readonly<CourseFormProps>) {
  const [isLoading, setIsLoading] = useState(false)
  const { createCourse, updateCourse, error, clearError } = useCourseStore()
  const isEditing = Boolean(course)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      code: course.code,
      title: course.title,
      description: course.description,
      credits: course.credits,
      maxStudents: course.maxStudents,
      instructor: course.instructor,
      schedule: course.schedule,
    } : {},
  })

  useEffect(() => {
    if (course) {
      reset({
        code: course.code,
        title: course.title,
        description: course.description,
        credits: course.credits,
        maxStudents: course.maxStudents,
        instructor: course.instructor,
        schedule: course.schedule,
      })
    }
  }, [course, reset])

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true)
      clearError()
      
      if (isEditing && course) {
        await updateCourse(course.id, data)
      } else {
        await createCourse(data)
      }
      
      reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting course:', error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Course' : 'Create New Course'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update course information' : 'Add a new course to the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Course Code
              </label>
              <div className="mt-1">
                <Input
                  id="code"
                  type="text"
                  placeholder="e.g., CS101"
                  {...register('code')}
                  className={errors.code ? 'border-red-300' : ''}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                Credits
              </label>
              <div className="mt-1">
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  {...register('credits', { valueAsNumber: true })}
                  className={errors.credits ? 'border-red-300' : ''}
                />
                {errors.credits && (
                  <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Course Title
            </label>
            <div className="mt-1">
              <Input
                id="title"
                type="text"
                placeholder="e.g., Introduction to Computer Science"
                {...register('title')}
                className={errors.title ? 'border-red-300' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <Textarea
                id="description"
                rows={3}
                placeholder="Course description..."
                {...register('description')}
                className={errors.description ? 'border-red-300' : ''}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
              Schedule
            </label>
            <div className="mt-1">
              <Input
                id="schedule"
                type="text"
                placeholder="e.g., Mon/Wed/Fri 9:00-10:30"
                {...register('schedule')}
                className={errors.schedule ? 'border-red-300' : ''}
              />
              {errors.schedule && (
                <p className="mt-1 text-sm text-red-600">{errors.schedule.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">
                Max Students
              </label>
              <div className="mt-1">
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  {...register('maxStudents', { valueAsNumber: true })}
                  className={errors.maxStudents ? 'border-red-300' : ''}
                />
                {errors.maxStudents && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">
                Instructor
              </label>
              <div className="mt-1">
                <Input
                  id="instructor"
                  type="text"
                  placeholder="Instructor name"
                  {...register('instructor')}
                  className={errors.instructor ? 'border-red-300' : ''}
                />
                {errors.instructor && (
                  <p className="mt-1 text-sm text-red-600">{errors.instructor.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {(() => {
                if (isLoading) {
                  return isEditing ? 'Updating...' : 'Creating...';
                }
                return isEditing ? 'Update Course' : 'Create Course';
              })()}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
