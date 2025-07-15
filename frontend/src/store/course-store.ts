import { create } from 'zustand'
import { Course, CourseCreateRequest, PaginatedResponse } from '@/types'
import apiClient from '@/lib/api-client'

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

export const useCourseStore = create<CourseState & CourseActions>()((set, get) => ({
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
      
      const response = await apiClient.get<PaginatedResponse<Course>>('/courses', {
        page,
        size,
      })
      
      set({
        courses: response.content,
        totalPages: response.totalPages,
        currentPage: response.number,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch courses'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  fetchCourseById: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      
      const course = await apiClient.get<Course>(`/courses/${id}`)
      
      set({
        currentCourse: course,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch course'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  createCourse: async (courseData: CourseCreateRequest) => {
    try {
      set({ isLoading: true, error: null })
      
      const course = await apiClient.post<Course>('/courses', courseData)
      
      // Add new course to the list
      set((state) => ({
        courses: [course, ...state.courses],
        isLoading: false,
      }))
      
      return course
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create course'
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
      
      const updatedCourse = await apiClient.put<Course>(`/courses/${id}`, courseData)
      
      // Update course in the list
      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? updatedCourse : course
        ),
        currentCourse: state.currentCourse?.id === id ? updatedCourse : state.currentCourse,
        isLoading: false,
      }))
      
      return updatedCourse
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update course'
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
      
      await apiClient.delete(`/courses/${id}`)
      
      // Remove course from the list
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
        isLoading: false,
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete course'
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
      
      const response = await apiClient.get<PaginatedResponse<Course>>('/courses/search', {
        query,
      })
      
      set({
        courses: response.content,
        totalPages: response.totalPages,
        currentPage: response.number,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to search courses'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
