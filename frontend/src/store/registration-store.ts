import { create } from 'zustand'
import { Registration, GradeUpdateRequest } from '@/types'
import api from '@/lib/api'

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
  dropCourse: (courseId: number) => Promise<void>
  deleteRegistration: (registrationId: number) => Promise<void>
  updateGrade: (registrationId: number, gradeData: GradeUpdateRequest) => Promise<Registration>
  isEnrolledInCourse: (courseId: number) => boolean
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
  fetchRegistrations: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // For admin, get all registrations - using status filter for paginated results
      const registrations = await api.get<Registration[]>('/registrations?status=ENROLLED')
      
      set({
        registrations: registrations,
        totalPages: 1,
        currentPage: 0,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message) 
        ? error.message : 'Failed to fetch registrations'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  fetchMyRegistrations: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const registrations = await api.get<Registration[]>('/registrations/my')
      
      set({
      registrations: registrations,
      totalPages: 1,
      currentPage: 0,
      isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = 
      (error instanceof Error && error.message) 
        ? error.message 
        : 'Failed to fetch my registrations'
      set({
      error: errorMessage,
      isLoading: false,
      })
    }
  },

  fetchRegistrationById: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      
      const registration = await api.get<Registration>(`/registrations/${id}`)
      
      set({
        currentRegistration: registration,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message) 
        ? error.message : 'Failed to fetch registration'
      set({
        error: errorMessage,
        isLoading: false,
      })
    }
  },

  enrollInCourse: async (courseId: number) => {
    try {
      set({ isLoading: true, error: null })
      
      const registration = await api.post<Registration>('/registrations', { courseId })
      
      // Add new registration to the list
      set((state) => ({
        registrations: [registration, ...state.registrations],
        isLoading: false,
      }))
      
      return registration
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to enroll in course'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  dropCourse: async (courseId: number) => {
    try {
      set({ isLoading: true, error: null })
      
      await api.delete(`/registrations/course/${courseId}`)
      
      // Remove registration from the list based on courseId
      set((state) => ({
        registrations: state.registrations.filter((reg) => reg.course.id !== courseId),
        currentRegistration: state.currentRegistration?.course.id === courseId ? null : state.currentRegistration,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message) 
        ? error.message : 'Failed to drop course'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  deleteRegistration: async (registrationId: number) => {
    try {
      set({ isLoading: true, error: null })
      
      await api.delete(`/registrations/${registrationId}`)
      
      // Remove registration from the list
      set((state) => ({
        registrations: state.registrations.filter((reg) => reg.id !== registrationId),
        currentRegistration: state.currentRegistration?.id === registrationId ? null : state.currentRegistration,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message) 
        ? error.message : 'Failed to delete registration'
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
      
      const updatedRegistration = await api.put<Registration>(`/registrations/${registrationId}/grade`, { grade: gradeData.grade })
      
      // Update the registration in the list
      set((state) => ({
        registrations: state.registrations.map((reg) =>
          reg.id === registrationId ? updatedRegistration : reg
        ),
        currentRegistration: state.currentRegistration?.id === registrationId ? updatedRegistration : state.currentRegistration,
        isLoading: false,
      }))
      
      return updatedRegistration
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message) 
        ? error.message : 'Failed to update grade'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null }),
  
  isEnrolledInCourse: (courseId: number) => {
    const { registrations } = get()
    return registrations.some(reg => reg.course.id === courseId && reg.status === 'ENROLLED')
  },
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
