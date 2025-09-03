'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard', className = '' }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedUsername = watch('username');
  const watchedPassword = watch('password');

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockoutTime === 0) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [lockoutTime, isLocked]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (watchedUsername || watchedPassword) {
      clearErrors('root');
    }
  }, [watchedUsername, watchedPassword, clearErrors]);

  const handleLockout = () => {
    setIsLocked(true);
    setLockoutTime(30); // 30 second lockout
    toast.error('Too many failed attempts. Please wait 30 seconds before trying again.');
  };

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      toast.error(`Please wait ${lockoutTime} seconds before trying again.`);
      return;
    }

    try {
      setIsSubmitting(true);
      clearErrors();
      
      await login(data.username, data.password);
      
      toast.success('Login successful!', {
        description: 'Welcome back! Redirecting to your dashboard...',
      });
      
      setLoginAttempts(0);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      let errorCode = 'UNKNOWN_ERROR';
      let shouldIncrementAttempts = true; // Default to incrementing

      if (error && typeof error === 'object' && 'code' in error) {
        errorCode = error.code as string;
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Only increment attempts for authentication-related errors, not network issues
      if (errorCode === 'NETWORK_ERROR' || errorCode === 'TIMEOUT' || errorCode === 'SERVER_ERROR') {
        shouldIncrementAttempts = false;
      }

      if (shouldIncrementAttempts) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          handleLockout();
          return;
        }
      }

      // Set specific field errors based on error type
      switch (errorCode) {
        case 'INVALID_CREDENTIALS':
          setError('root', { 
            type: 'manual', 
            message: 'Invalid username or password. Please check your credentials and try again.' 
          });
          break;
        case 'ACCOUNT_LOCKED':
          setError('root', { 
            type: 'manual', 
            message: 'Your account has been locked. Please contact support.' 
          });
          break;
        case 'NETWORK_ERROR':
          setError('root', { 
            type: 'manual', 
            message: 'Network error. Please check your connection and try again.' 
          });
          break;
        default:
          setError('root', { type: 'manual', message: errorMessage });
      }

      toast.error(errorMessage, {
        description: shouldIncrementAttempts ? `${5 - (loginAttempts + 1)} attempts remaining before temporary lockout.` : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getFieldStatus = (fieldName: keyof LoginFormData) => {
    const hasError = !!errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watch(fieldName);

    if (hasError) return 'error';
    if (isTouched && hasValue && !hasError) return 'success';
    return 'default';
  };

  const getInputClassName = (fieldName: keyof LoginFormData) => {
    const status = getFieldStatus(fieldName);
    const baseClasses = 'mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500`;
      case 'success':
        return `${baseClasses} border-green-300 text-green-900 focus:border-green-500 focus:ring-green-500`;
      default:
        return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }
  };

  const getFieldIcon = (fieldName: keyof LoginFormData) => {
    const status = getFieldStatus(fieldName);
    
    switch (status) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Username Field */}
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              {...register('username')}
              id="username"
              type="text"
              autoComplete="username"
              className={getInputClassName('username')}
              placeholder="Enter your username"
              disabled={isSubmitting || isLocked}
              aria-invalid={errors.username ? 'true' : 'false'}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {getFieldIcon('username')}
            </div>
          </div>
          {errors.username && (
            <p 
              id="username-error" 
              className="mt-1 text-sm text-red-600" 
              role="alert"
            >
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${getInputClassName('password')} pr-20`}
              placeholder="Enter your password"
              disabled={isSubmitting || isLocked}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                disabled={isSubmitting || isLocked}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <div className="pr-3 flex items-center pointer-events-none">
                {getFieldIcon('password')}
              </div>
            </div>
          </div>
          {errors.password && (
            <p 
              id="password-error" 
              className="mt-1 text-sm text-red-600" 
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Global Error Message */}
        {errors.root && (
          <div 
            className="rounded-md bg-red-50 p-4 border border-red-200" 
            role="alert"
            aria-live="polite"
          >
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Login Failed
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {errors.root.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lockout Warning */}
        {isLocked && (
          <div 
            className="rounded-md bg-yellow-50 p-4 border border-yellow-200" 
            role="alert"
            aria-live="polite"
          >
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Temporarily Locked
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Please wait {lockoutTime} seconds before trying again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isLocked || !isValid}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-describedby={isLocked ? 'lockout-message' : undefined}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
              Logging in...
            </>
          ) : isLocked ? (
            `Locked (${lockoutTime}s)`
          ) : (
            'Login'
          )}
        </Button>

        {/* Registration Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-200"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isSubmitting && 'Logging in, please wait...'}
          {isLocked && `Account locked for ${lockoutTime} seconds`}
          {errors.root && `Login error: ${errors.root.message}`}
        </div>
      </form>
    </div>
  );
}