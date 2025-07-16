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
  initialize: () => void
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
          
          const response = await apiClient.post<AuthResponse>('/auth/login', { ...credentials })
          
          // Store tokens in localStorage - Fix: use accessToken from backend response
          localStorage.setItem('token', response.accessToken)
          localStorage.setItem('refreshToken', response.refreshToken)
          
          set({
            user: response.user,
            token: response.accessToken,  // Fix: was response.token
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: unknown) {
          const errorMessage = (error instanceof Error && error.message)
            ? error.message : 'Login failed'
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
          
          const response = await apiClient.post<AuthResponse>('/auth/register', { ...userData })
          
          // Store tokens in localStorage - Fix: use accessToken from backend response
          localStorage.setItem('token', response.accessToken)
          localStorage.setItem('refreshToken', response.refreshToken)
          
          set({
            user: response.user,
            token: response.accessToken,  // Fix: was response.token
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: unknown) {
          const errorMessage = (error instanceof Error && error.message)
            ? error.message : 'Registration failed'
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

          const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
            refreshToken,
          })
          
          localStorage.setItem('token', response.accessToken)
          
          set({
            token: response.accessToken,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      initialize: () => {
        // Check if we have stored tokens and restore authentication state
        const storedToken = localStorage.getItem('token')
        const storedRefreshToken = localStorage.getItem('refreshToken')
        
        if (storedToken && storedRefreshToken) {
          // Check if the stored state is different from current state
          const currentState = get()
          if (!currentState.isAuthenticated || !currentState.token) {
            // We have tokens but not authenticated, try to restore
            // This will be validated by the API interceptor
            set({
              token: storedToken,
              refreshToken: storedRefreshToken,
              isAuthenticated: true,
            })
          }
        }
      },
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
