'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCourseStore } from '@/store/course-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  description: z.string().min(1, 'Course description is required'),
  credits: z.number().min(1, 'Credits must be at least 1').max(10, 'Credits cannot exceed 10'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  instructor: z.string().min(1, 'Instructor name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

type CourseFormData = z.infer<typeof courseSchema>

interface CourseFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CourseForm({ onSuccess, onCancel }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { createCourse, error, clearError } = useCourseStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true)
      clearError()
      await createCourse(data)
      reset()
      onSuccess?.()
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>
          Add a new course to the system
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <div className="mt-1">
              <Input
                id="name"
                type="text"
                placeholder="e.g., Introduction to Computer Science"
                {...register('name')}
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <div className="mt-1">
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  {...register('capacity', { valueAsNumber: true })}
                  className={errors.capacity ? 'border-red-300' : ''}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-red-300' : ''}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-red-300' : ''}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
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
              {isLoading ? 'Creating...' : 'Create Course'}
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
