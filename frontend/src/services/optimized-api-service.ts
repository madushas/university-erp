import { api } from '../lib/api-service'
import { 
  Course, 
  Registration, 
  PaginatedResponse,
  CourseCreateRequest
} from '../types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
}

class ApiCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    }
    this.cache.set(key, entry)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export class OptimizedApiService {
  private readonly cache = new ApiCache()
  private readonly pendingRequests = new Map<string, Promise<unknown>>()

  // Enhanced error handling with retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    backoffMs = 1000
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: unknown) {
        if (error instanceof Error) {
          lastError = error;
        } else {
          lastError = new Error(String(error));
        }
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof Error && ((error as { response?: { status: number } }).response?.status ?? 0) >= 400 && ((error as { response?: { status: number } }).response?.status ?? 0) < 500 && ((error as { response?: { status: number } }).response?.status ?? 0) !== 429) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = backoffMs * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  // Cached API calls with deduplication
  private async cachedRequest<T>(
    key: string,
    operation: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl } = options

    // Check cache first
    const cached = this.cache.get<T>(key)
    if (cached) {
      return cached
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending as Promise<T>
    }

    // Make the request
    const promise = this.executeWithRetry(operation)
    this.pendingRequests.set(key, promise)

    try {
      const result = await promise
      this.cache.set(key, result, ttl)
      return result
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  // Registration API methods
  async getMyRegistrations(useCache = true): Promise<Registration[]> {
    const cacheKey = 'my-registrations'
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.registrations.getMyRegistrations())
    }
    
    return api.registrations.getMyRegistrations()
  }

  async getUserRegistrations(userId: number, useCache = true): Promise<Registration[]> {
    const cacheKey = `user-registrations:${userId}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.registrations.getUserRegistrations(userId))
    }
    
    return api.registrations.getUserRegistrations(userId)
  }

  async getCourseRegistrations(courseId: number, useCache = true): Promise<Registration[]> {
    const cacheKey = `course-registrations:${courseId}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.registrations.getCourseRegistrations(courseId))
    }
    
    return api.registrations.getCourseRegistrations(courseId)
  }

  async getRegistrationById(id: number, useCache = true): Promise<Registration> {
    const cacheKey = `registration:${id}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.registrations.getRegistrationById(id))
    }
    
    return api.registrations.getRegistrationById(id)
  }

  async getRegistrationsByStatus(status: string, useCache = true): Promise<Registration[]> {
    const cacheKey = `registrations-by-status:${status}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.registrations.getRegistrationsByStatus(status))
    }
    
    return api.registrations.getRegistrationsByStatus(status)
  }

  // Course API methods
  async getCourses(page = 0, size = 10, useCache = true): Promise<PaginatedResponse<Course>> {
    const cacheKey = `courses:${page}:${size}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.courses.getCourses(page, size))
    }
    
    return api.courses.getCourses(page, size)
  }

  async getCourseById(id: number, useCache = true): Promise<Course> {
    const cacheKey = `course:${id}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.courses.getCourseById(id))
    }
    
    return api.courses.getCourseById(id)
  }

  // Optimistic updates with cache invalidation
  async enrollInCourse(courseId: number): Promise<Registration> {
    // Invalidate related caches
    this.cache.invalidate('my-registrations')
    this.cache.invalidate(`course-registrations:${courseId}`)
    this.cache.invalidate(`course:${courseId}`)
    
    return this.executeWithRetry(() => api.registrations.enrollInCourse(courseId))
  }

  async dropCourse(courseId: number): Promise<void> {
    // Invalidate related caches
    this.cache.invalidate('my-registrations')
    this.cache.invalidate(`course-registrations:${courseId}`)
    this.cache.invalidate(`course:${courseId}`)
    
    return this.executeWithRetry(() => api.registrations.dropCourse(courseId))
  }

  async deleteRegistration(registrationId: number): Promise<void> {
    // Invalidate related caches
    this.cache.invalidate('my-registrations')
    this.cache.invalidate('user-registrations:')
    this.cache.invalidate('course-registrations:')
    this.cache.invalidate(`registration:${registrationId}`)
    
    return this.executeWithRetry(() => api.registrations.deleteRegistration(registrationId))
  }

  async updateGrade(registrationId: number, grade: string): Promise<Registration> {
    // Invalidate related caches
    this.cache.invalidate('my-registrations')
    this.cache.invalidate('user-registrations:')
    this.cache.invalidate('course-registrations:')
    this.cache.invalidate(`registration:${registrationId}`)
    
    return this.executeWithRetry(() => api.registrations.updateGrade(registrationId, grade))
  }

  async updateStatus(registrationId: number, status: string): Promise<Registration> {
    // Invalidate related caches
    this.cache.invalidate('my-registrations')
    this.cache.invalidate('user-registrations:')
    this.cache.invalidate('course-registrations:')
    this.cache.invalidate(`registration:${registrationId}`)
    
    return this.executeWithRetry(() => api.registrations.updateStatus(registrationId, status))
  }

  async createCourse(courseData: CourseCreateRequest): Promise<Course> {
    // Invalidate course caches
    this.cache.invalidate('courses:')
    
    return this.executeWithRetry(() => api.courses.createCourse(courseData))
  }

  async updateCourse(courseId: number, courseData: Partial<CourseCreateRequest>): Promise<Course> {
    // Invalidate related caches
    this.cache.invalidate('courses:')
    this.cache.invalidate(`course:${courseId}`)
    
    return this.executeWithRetry(() => api.courses.updateCourse(courseId, courseData))
  }

  async deleteCourse(courseId: number): Promise<void> {
    // Invalidate related caches
    this.cache.invalidate('courses:')
    this.cache.invalidate(`course:${courseId}`)
    this.cache.invalidate('my-registrations')
    this.cache.invalidate('user-registrations:')
    this.cache.invalidate('course-registrations:')
    
    return this.executeWithRetry(() => api.courses.deleteCourse(courseId))
  }

  // Analytics methods
  async getDashboardAnalytics(useCache = true) {
    const cacheKey = 'dashboard-analytics'
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.analytics.getDashboardAnalytics(), { ttl: 2 * 60 * 1000 })
    }
    
    return api.analytics.getDashboardAnalytics()
  }

  async getCourseAnalytics(courseId: number, useCache = true) {
    const cacheKey = `course-analytics:${courseId}`
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.analytics.getCourseAnalytics(courseId), { ttl: 5 * 60 * 1000 })
    }
    
    return api.analytics.getCourseAnalytics(courseId)
  }

  async getFinancialAnalytics(useCache = true) {
    const cacheKey = 'financial-analytics'
    
    if (useCache) {
      return this.cachedRequest(cacheKey, () => api.analytics.getFinancialAnalytics(), { ttl: 5 * 60 * 1000 })
    }
    
    return api.analytics.getFinancialAnalytics()
  }

  // Cache management
  getCacheStats() {
    return this.cache.getStats()
  }

  clearCache() {
    this.cache.invalidate()
  }

  invalidateCache(pattern?: string) {
    this.cache.invalidate(pattern)
  }

  // Prefetch for performance
  async prefetchUserData() {
    try {
      await Promise.all([
        this.getMyRegistrations(true),
        this.getCourses(0, 20, true)
      ])
    } catch (error) {
      console.warn('Prefetch failed:', error)
    }
  }
}

// Create singleton instance
export const optimizedApiService = new OptimizedApiService()
