import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

class ApiClient {
  private readonly instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(new Error(error.message || 'Request error'))
      }
    )

    // Response interceptor to handle token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config ? (error.config as unknown as Record<string, unknown>) : {}

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await this.instance.post('/auth/refresh', {
                refreshToken,
              })
              
              const accessToken = response.data?.accessToken
              if (accessToken) {
                localStorage.setItem('token', accessToken)
              } else {
                throw new Error('Access token is missing in the response')
              }
              
              // Retry the original request with new token
              (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`
              return this.instance(originalRequest)
            }
          } catch {
            // Refresh failed, redirect to login
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.post(url, data)
    return response.data
  }

  async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete(url)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient
