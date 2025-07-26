'use client'

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/components/ui/toast-provider"
import ErrorBoundary from "@/components/error-boundary"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}