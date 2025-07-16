'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check if we have a token in localStorage but not in state
    // This happens after page refresh when persistence hasn't loaded yet
    const storedToken = localStorage.getItem('token')
    
    if (storedToken && !isAuthenticated) {
      // Try to verify the token by making a simple API call
      // If it fails, it will be handled by the API interceptor
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      }).catch(() => {
        // Token is invalid, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      })
    }
  }, [isAuthenticated])

  return <>{children}</>
}
