import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types'
import apiClient from '@/lib/api-client'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
          
          // Store tokens in localStorage
          localStorage.setItem('token', response.token)
          localStorage.setItem('refreshToken', response.refreshToken)
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          })
          throw new Error(errorMessage)
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await apiClient.post<AuthResponse>('/auth/register', userData)
          
          // Store tokens in localStorage
          localStorage.setItem('token', response.token)
          localStorage.setItem('refreshToken', response.refreshToken)
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          })
          throw new Error(errorMessage)
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await apiClient.post<{ token: string }>('/auth/refresh', {
            refreshToken,
          })
          
          localStorage.setItem('token', response.token)
          
          set({
            token: response.token,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
