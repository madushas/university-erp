'use client'

import React, { Component } from 'react'
import { Button } from '@/components/ui/button'
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Something went wrong</h3>
              </div>
              <p className="mt-2 text-sm text-red-700">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-red-800">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto text-red-900">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={this.resetError}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// API Error Handler Component
export const ApiErrorHandler: React.FC<{
  error: string | null
  onRetry?: () => void
  onClear?: () => void
}> = ({ error, onRetry, onClear }) => {
  if (!error) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h4 className="font-semibold text-red-800">API Error</h4>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          )}
          {onClear && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading State Component
export const LoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  </div>
)

// Success Message Component
export const SuccessMessage: React.FC<{
  message: string
  onClose?: () => void
}> = ({ message, onClose }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2" />
        <span className="text-green-800">{message}</span>
      </div>
      {onClose && (
        <Button size="sm" variant="ghost" onClick={onClose}>
          ×
        </Button>
      )}
    </div>
  </div>
)

export default ErrorBoundary
