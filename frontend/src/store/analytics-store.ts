import { create } from 'zustand'
import { analyticsApi } from '@/lib/api-service'
import { 
  CourseAnalytics
} from '@/types'

export interface DashboardAnalytics {
  totalStudents: number
  totalCourses: number
  totalRegistrations: number
  completedCourses: number
  activeRegistrations: number
  pendingRegistrations: number
  totalFaculty?: number
  totalRevenue?: number
  unpaidRegistrations?: number
  completedRegistrations?: number
  totalDepartments?: number
  currentGPA?: number
  totalCredits?: number
  averageGpa?: number
  activeEnrollments?: number
  completionRate?: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: number
  type: 'COURSE_CREATED' | 'STUDENT_ENROLLED' | 'COURSE_COMPLETED' | 'COURSE_DROPPED'
  description: string
  timestamp: string
  user?: string
  course?: string
}

export interface DepartmentAnalytics {
  totalCourses: number
  totalRegistrations: number
  totalRevenue: number
  averageCourseFee: number
  totalStudents: number
}

export interface StudentAnalytics {
  totalRegistrations: number
  currentGPA: number
  activeRegistrations: number
  completedRegistrations: number
  droppedRegistrations: number
  totalCredits: number
  totalFeePaid: number
  outstandingPayments: number
  averageAttendance: number
}

interface AnalyticsState {
  dashboardAnalytics: DashboardAnalytics | null
  departmentAnalytics: { [key: string]: DepartmentAnalytics }
  studentAnalytics: StudentAnalytics | null
  courseAnalytics: CourseAnalytics[]
  isLoading: boolean
  loading: boolean
  error: string | null
}

interface AnalyticsActions {
  fetchDashboardAnalytics: () => Promise<void>
  fetchDepartmentAnalytics: (departmentCode: string) => Promise<void>
  fetchStudentAnalytics: (studentId: number) => Promise<void>
  fetchCourseAnalytics: (courseId: number) => Promise<void>
  fetchRecentActivity: () => Promise<void>
  fetchFinancialAnalytics: () => Promise<void>
  clearError: () => void
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()((set) => ({
  // Initial state
  dashboardAnalytics: null,
  departmentAnalytics: {},
  studentAnalytics: null,
  courseAnalytics: [],
  isLoading: false,
  loading: false,
  error: null,

  // Actions
  fetchDashboardAnalytics: async () => {
    try {
      set({ isLoading: true, loading: true, error: null })
      const analytics = await analyticsApi.getDashboardAnalytics()
      set({ dashboardAnalytics: analytics, isLoading: false, loading: false })
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch dashboard analytics'
      set({ error: errorMessage, isLoading: false, loading: false })
      throw new Error(errorMessage)
    }
  },

  fetchDepartmentAnalytics: async (departmentCode: string) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      const response = await analyticsApi.getDepartmentAnalytics(departmentCode)
      const analytics: DepartmentAnalytics = {
        totalCourses: Number(response.totalCourses) || 0,
        totalRegistrations: Number(response.totalRegistrations) || 0,
        totalRevenue: Number(response.totalRevenue) || 0,
        averageCourseFee: Number(response.averageCourseFee) || 0,
        totalStudents: Number(response.totalStudents) || 0,
      }
      set(state => ({
        departmentAnalytics: {
          ...state.departmentAnalytics,
          [departmentCode]: analytics
        },
        isLoading: false,
        loading: false
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch department analytics'
      set({ error: errorMessage, isLoading: false, loading: false })
      throw new Error(errorMessage)
    }
  },

  fetchStudentAnalytics: async (studentId: number) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      const response = await analyticsApi.getStudentAnalytics(studentId)
      const analytics: StudentAnalytics = {
        totalRegistrations: Number(response.totalRegistrations) || 0,
        currentGPA: Number(response.currentGPA) || 0,
        activeRegistrations: Number(response.activeRegistrations) || 0,
        completedRegistrations: Number(response.completedRegistrations) || 0,
        droppedRegistrations: Number(response.droppedRegistrations) || 0,
        totalCredits: Number(response.totalCredits) || 0,
        totalFeePaid: Number(response.totalFeePaid) || 0,
        outstandingPayments: Number(response.outstandingPayments) || 0,
        averageAttendance: Number(response.averageAttendance) || 0,
      }
      set({ studentAnalytics: analytics, isLoading: false, loading: false })
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch student analytics'
      set({ error: errorMessage, isLoading: false, loading: false })
      throw new Error(errorMessage)
    }
  },

  fetchCourseAnalytics: async (courseId: number) => {
    try {
      set({ isLoading: true, loading: true, error: null })
      const analytics = await analyticsApi.getCourseAnalytics(courseId)
      set(state => ({
        courseAnalytics: [...state.courseAnalytics.filter(c => c.courseId !== courseId), analytics],
        isLoading: false,
        loading: false
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch course analytics'
      set({ error: errorMessage, isLoading: false, loading: false })
      throw new Error(errorMessage)
    }
  },

  fetchRecentActivity: async () => {
    try {
      set({ isLoading: true, loading: true, error: null })
      const activities = await analyticsApi.getRecentActivity()
      set(state => ({
        dashboardAnalytics: state.dashboardAnalytics ? {
          ...state.dashboardAnalytics,
          recentActivity: Array.isArray(activities) ? activities as ActivityItem[] : []
        } : null,
        isLoading: false,
        loading: false
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch recent activity'
      set({ error: errorMessage, isLoading: false, loading: false })
      throw new Error(errorMessage)
    }
  },

  fetchFinancialAnalytics: async () => {
    try {
      set({ isLoading: true, loading: true, error: null })
      const financialData = await analyticsApi.getFinancialAnalytics()
      set(state => ({
        dashboardAnalytics: state.dashboardAnalytics ? {
          ...state.dashboardAnalytics,
          ...financialData
        } : null,
        isLoading: false,
        loading: false
      }))
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error && error.message)
        ? error.message : 'Failed to fetch financial analytics'
      set({ error: errorMessage, isLoading: false, loading: false })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null })
}))
