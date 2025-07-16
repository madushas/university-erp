'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import Navigation from '@/components/navigation'
import { DashboardPage } from '@/components/dashboard/dashboard-page'

export default function HomePage() {
  const { isAuthenticated, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Navigation>
      <DashboardPage />
    </Navigation>
  )
}
