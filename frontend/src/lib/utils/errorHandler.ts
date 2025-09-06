import { toast } from 'sonner';

// Error types for better categorization
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

// Enhanced error class with context
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly status?: number;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    status?: number,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.status = status;
    this.context = context;
    this.timestamp = new Date();
  }
}

// Error classification helper
export const classifyError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return new AppError(
        'Authentication required. Please log in again.',
        ErrorType.AUTHENTICATION,
        'AUTH_REQUIRED',
        401
      );
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return new AppError(
        'You do not have permission to perform this action.',
        ErrorType.AUTHORIZATION,
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    if (error.message.includes('400') || error.message.includes('Bad Request')) {
      return new AppError(
        'Invalid request. Please check your input and try again.',
        ErrorType.VALIDATION,
        'INVALID_REQUEST',
        400
      );
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return new AppError(
        'The requested resource was not found.',
        ErrorType.CLIENT,
        'RESOURCE_NOT_FOUND',
        404
      );
    }

    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return new AppError(
        'A server error occurred. Please try again later.',
        ErrorType.SERVER,
        'INTERNAL_SERVER_ERROR',
        500
      );
    }

    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return new AppError(
        'Network error. Please check your connection and try again.',
        ErrorType.NETWORK,
        'NETWORK_ERROR'
      );
    }

    // Generic error
    return new AppError(
      error.message,
      ErrorType.CLIENT,
      'GENERIC_ERROR'
    );
  }

  // Unknown error type
  return new AppError(
    'An unexpected error occurred.',
    ErrorType.UNKNOWN,
    'UNKNOWN_ERROR',
    undefined,
    { originalError: error }
  );
};

// User-friendly error messages
const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      return 'Please log in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.NETWORK:
      return 'Connection problem. Please check your internet and try again.';
    case ErrorType.SERVER:
      return 'Server is temporarily unavailable. Please try again later.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

// Centralized error handler
export const handleError = (
  error: unknown,
  context?: string,
  showToast: boolean = true
): AppError => {
  const appError = classifyError(error);
  
  // Log error for debugging
  console.error(`[${context || 'App'}] Error:`, {
    message: appError.message,
    type: appError.type,
    code: appError.code,
    status: appError.status,
    context: appError.context,
    timestamp: appError.timestamp,
    stack: appError.stack
  });

  // Show user-friendly toast notification
  if (showToast) {
    const userMessage = getUserFriendlyMessage(appError);
    
    switch (appError.type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        toast.error(userMessage, {
          description: 'Redirecting to login...',
          duration: 4000
        });
        break;
      case ErrorType.VALIDATION:
        toast.error(userMessage, {
          description: 'Please review the form and try again.',
          duration: 5000
        });
        break;
      case ErrorType.NETWORK:
        toast.error(userMessage, {
          description: 'Check your connection and retry.',
          duration: 6000
        });
        break;
      case ErrorType.SERVER:
        toast.error(userMessage, {
          description: 'Our team has been notified.',
          duration: 6000
        });
        break;
      default:
        toast.error(userMessage, {
          duration: 4000
        });
    }
  }

  return appError;
};

// Async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string,
  showToast: boolean = true
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    throw handleError(error, context, showToast);
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  return {
    handleError: (error: unknown, context?: string, showToast: boolean = true) =>
      handleError(error, context, showToast),
    withErrorHandling: <T>(
      operation: () => Promise<T>,
      context?: string,
      showToast: boolean = true
    ) => withErrorHandling(operation, context, showToast)
  };
};

// Form validation error helper
export const handleFormError = (error: unknown, fieldName?: string): string => {
  const appError = classifyError(error);
  
  if (appError.type === ErrorType.VALIDATION && fieldName) {
    return `${fieldName}: ${appError.message}`;
  }
  
  return getUserFriendlyMessage(appError);
};

// API error response helper
export const extractApiError = (response: { error?: unknown }): AppError | null => {
  if (!response.error) return null;
  
  return classifyError(response.error);
};
