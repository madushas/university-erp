'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(false)
  const { user, token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Simple hydration check
    setHydrated(true)
  }, [])

  return { hydrated, user, token, isAuthenticated }
}
