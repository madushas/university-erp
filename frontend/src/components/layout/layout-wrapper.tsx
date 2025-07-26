'use client'

import { usePathname } from 'next/navigation'
import AppLayout from './app-layout'

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Pages that don't need the sidebar layout
const publicPages = ['/login', '/register']

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Check if current page is a public page
  const isPublicPage = publicPages.includes(pathname)
  
  if (isPublicPage) {
    return <>{children}</>
  }
  
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
}
