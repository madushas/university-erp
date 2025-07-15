import { create } from 'zustand'
import { Registration, RegistrationCreateRequest, GradeUpdateRequest, PaginatedResponse } from '@/types'
import apiClient from '@/lib/api-client'

interface RegistrationState {
  registrations: Registration[]
  currentRegistration: Registration | null
  totalPages: number
  currentPage: number
  isLoading: boolean
  error: string | null
}

interface RegistrationActions {
  fetchRegistrations: (page?: number, size?: number) => Promise<void>
  fetchMyRegistrations: (page?: number, size?: number) => Promise<void>
  fetchRegistrationById: (id: number) => Promise<void>
  enrollInCourse: (courseId: number) => Promise<Registration>
  dropCourse: (registrationId: number) => Promise<void>
  updateGrade: (registrationId: number, gradeData: GradeUpdateRequest) => Promise<Registration>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useRegistrationStore = create<RegistrationState & RegistrationActions>()((set, get) => ({
  // Initial state
  registrations: [],
  currentRegistration: null,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchRegistrations: async (page = 0, size = 10) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await apiClient.get<PaginatedResponse<Registration>>('/registrations', {
        page,
        size,
      })
      
      set({
        registrations: response.content,
        totalPages: response.totalPages,
        currentPage: response.number,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch registrations'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  fetchMyRegistrations: async (page = 0, size = 10) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await apiClient.get<PaginatedResponse<Registration>>('/registrations/my', {
        page,
        size,
      })
      
      set({
        registrations: response.content,
        totalPages: response.totalPages,
        currentPage: response.number,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch my registrations'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  fetchRegistrationById: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      
      const registration = await apiClient.get<Registration>(`/registrations/${id}`)
      
      set({
        currentRegistration: registration,
        isLoading: false,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch registration'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  enrollInCourse: async (courseId: number) => {
    try {
      set({ isLoading: true, error: null })
      
      const registration = await apiClient.post<Registration>('/registrations', { courseId })
      
      // Add new registration to the list
      set((state) => ({
        registrations: [registration, ...state.registrations],
        isLoading: false,
      }))
      
      return registration
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  dropCourse: async (registrationId: number) => {
    try {
      set({ isLoading: true, error: null })
      
      await apiClient.delete(`/registrations/${registrationId}`)
      
      // Remove registration from the list
      set((state) => ({
        registrations: state.registrations.filter((reg) => reg.id !== registrationId),
        currentRegistration: state.currentRegistration?.id === registrationId ? null : state.currentRegistration,
        isLoading: false,
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to drop course'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  updateGrade: async (registrationId: number, gradeData: GradeUpdateRequest) => {
    try {
      set({ isLoading: true, error: null })
      
      const updatedRegistration = await apiClient.put<Registration>(
        `/registrations/${registrationId}/grade`,
        gradeData
      )
      
      // Update registration in the list
      set((state) => ({
        registrations: state.registrations.map((reg) =>
          reg.id === registrationId ? updatedRegistration : reg
        ),
        currentRegistration: state.currentRegistration?.id === registrationId 
          ? updatedRegistration 
          : state.currentRegistration,
        isLoading: false,
      }))
      
      return updatedRegistration
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update grade'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
