"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { Toast } from "@/components/ui/toast"

interface ToastOptions {
  variant?: "default" | "success" | "error" | "warning" | "info"
  title?: string
  description?: string
  duration?: number
  action?: React.ReactNode
}

interface ToastItem extends ToastOptions {
  id: string
  createdAt: number
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((options: ToastOptions) => {
    const id = generateId()
    const toast: ToastItem = {
      id,
      createdAt: Date.now(),
      duration: 5000,
      ...options,
    }

    setToasts(prev => [...prev, toast])

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, toast.duration)
    }
  }, [generateId, dismissToast])

  const dismissAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const toast = useCallback((options: ToastOptions) => {
    addToast(options)
  }, [addToast])

  const success = useCallback((title: string, description?: string) => {
    addToast({ variant: "success", title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ variant: "error", title, description })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    addToast({ variant: "warning", title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    addToast({ variant: "info", title, description })
  }, [addToast])

  const contextValue: ToastContextType = {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-right-full"
          >
            <Toast
              variant={toast.variant}
              title={toast.title}
              description={toast.description}
              action={toast.action}
              onClose={() => onDismiss(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}
