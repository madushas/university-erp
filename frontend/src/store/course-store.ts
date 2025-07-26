import { create } from 'zustand'
import { Course, CourseCreateRequest } from '@/types'
import api from '@/lib/api'

interface CourseState {
  courses: Course[]
  currentCourse: Course | null
  totalPages: number
  currentPage: number
  isLoading: boolean
  error: string | null
}

interface CourseActions {
  fetchCourses: (page?: number, size?: number) => Promise<void>
  fetchCourseById: (id: number) => Promise<void>
  createCourse: (courseData: CourseCreateRequest) => Promise<Course>
  updateCourse: (id: number, courseData: Partial<CourseCreateRequest>) => Promise<Course>
  deleteCourse: (id: number) => Promise<void>
  searchCourses: (query: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useCourseStore = create<CourseState & CourseActions>()((set) => ({
  // Initial state
  courses: [],
  currentCourse: null,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchCourses: async (page = 0, size = 10) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await api.get<{ courses: Course[], totalPages: number }>(`/courses?page=${page}&size=${size}`)
      
      set({
        courses: response.courses,
        totalPages: response.totalPages,
        currentPage: page,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch courses'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  fetchCourseById: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      
      const course = await api.get<Course>(`/courses/${id}`)
      
      set({
        currentCourse: course,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch course'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  createCourse: async (courseData: CourseCreateRequest) => {
    try {
      set({ isLoading: true, error: null })
      
      const course = await api.post<Course>('/courses', courseData)
      
      // Add new course to the list
      set((state) => ({
        courses: [course, ...state.courses],
        isLoading: false,
      }))
      
      return course
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to create course'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  updateCourse: async (id: number, courseData: Partial<CourseCreateRequest>) => {
    try {
      set({ isLoading: true, error: null })
      
      const updatedCourse = await api.put<Course>(`/courses/${id}`, courseData)
      
      // Update course in the list
      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? updatedCourse : course
        ),
        currentCourse: state.currentCourse?.id === id ? updatedCourse : state.currentCourse,
        isLoading: false,
      }))
      
      return updatedCourse
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to update course'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  deleteCourse: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      
      await api.delete(`/courses/${id}`)
      
      // Remove course from the list
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message
        ? error.message : 'Failed to delete course'
      )
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  searchCourses: async (query: string) => {
    try {
      set({ isLoading: true, error: null })
      
      // For now, use client-side filtering
      const response = await api.get<{ courses: Course[], totalPages: number }>('/courses?page=0&size=100') // Get more courses for search
      const filteredCourses = response.courses.filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.code.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase())
      )
      
      set({
        courses: filteredCourses,
        totalPages: 1,
        currentPage: 0,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to search courses'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
