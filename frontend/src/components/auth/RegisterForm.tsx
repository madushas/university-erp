'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export function RegisterForm({ onSuccess, redirectTo = '/dashboard', className = '' }: RegisterFormProps) {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'STUDENT',
      acceptTerms: false,
    },
  });

  const watchedPassword = watch('password');

  // Calculate password strength
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!watchedPassword) {
      return {
        score: 0,
        label: 'Enter a password',
        color: 'gray',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
      };
    }

    const requirements = {
      length: watchedPassword.length >= 8,
      uppercase: /[A-Z]/.test(watchedPassword),
      lowercase: /[a-z]/.test(watchedPassword),
      number: /\d/.test(watchedPassword),
      special: /[@$!%*?&]/.test(watchedPassword),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let label = '';
    let color = '';

    switch (score) {
      case 0:
      case 1:
        label = 'Very Weak';
        color = 'red';
        break;
      case 2:
        label = 'Weak';
        color = 'orange';
        break;
      case 3:
        label = 'Fair';
        color = 'yellow';
        break;
      case 4:
        label = 'Good';
        color = 'blue';
        break;
      case 5:
        label = 'Strong';
        color = 'green';
        break;
      default:
        label = 'Enter a password';
        color = 'gray';
    }

    return { score, label, color, requirements };
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      clearErrors();
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, acceptTerms, ...registerData } = data;
      await registerUser(registerData);
      
      toast.success('Registration successful!', {
        description: 'Welcome! Your account has been created successfully.',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      let errorCode = 'UNKNOWN_ERROR';

      if (error && typeof error === 'object' && 'code' in error) {
        errorCode = error.code as string;
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Set specific field errors based on error type
      switch (errorCode) {
        case 'USERNAME_EXISTS':
          setError('username', { 
            type: 'manual', 
            message: 'This username is already taken. Please choose another.' 
          });
          break;
        case 'EMAIL_EXISTS':
          setError('email', { 
            type: 'manual', 
            message: 'An account with this email already exists.' 
          });
          break;
        case 'INVALID_REQUEST':
          setError('root', { 
            type: 'manual', 
            message: 'Please check your information and try again.' 
          });
          break;
        default:
          setError('root', { type: 'manual', message: errorMessage });
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldStatus = (fieldName: keyof RegisterFormData) => {
    const hasError = !!errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watch(fieldName);

    if (hasError) return 'error';
    if (isTouched && hasValue && !hasError) return 'success';
    return 'default';
  };

  const getInputClassName = (fieldName: keyof RegisterFormData) => {
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

  const getFieldIcon = (fieldName: keyof RegisterFormData) => {
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
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500" aria-label="required">*</span>
            </label>
            <div className="relative">
              <input
                {...register('firstName')}
                id="firstName"
                type="text"
                autoComplete="given-name"
                className={getInputClassName('firstName')}
                placeholder="Enter your first name"
                disabled={isSubmitting}
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {getFieldIcon('firstName')}
              </div>
            </div>
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500" aria-label="required">*</span>
            </label>
            <div className="relative">
              <input
                {...register('lastName')}
                id="lastName"
                type="text"
                autoComplete="family-name"
                className={getInputClassName('lastName')}
                placeholder="Enter your last name"
                disabled={isSubmitting}
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {getFieldIcon('lastName')}
              </div>
            </div>
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              {...register('username')}
              id="username"
              type="text"
              autoComplete="username"
              className={getInputClassName('username')}
              placeholder="Choose a unique username"
              disabled={isSubmitting}
              aria-invalid={errors.username ? 'true' : 'false'}
              aria-describedby={errors.username ? 'username-error username-help' : 'username-help'}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {getFieldIcon('username')}
            </div>
          </div>
          <p id="username-help" className="mt-1 text-xs text-gray-500">
            3-30 characters, letters, numbers, hyphens, and underscores only
          </p>
          {errors.username && (
            <p id="username-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              className={getInputClassName('email')}
              placeholder="Enter your email address"
              disabled={isSubmitting}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {getFieldIcon('email')}
            </div>
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500" aria-label="required">*</span>
          </label>
          <select
            {...register('role')}
            id="role"
            className={getInputClassName('role')}
            disabled={isSubmitting}
            aria-invalid={errors.role ? 'true' : 'false'}
            aria-describedby={errors.role ? 'role-error' : undefined}
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Administrator</option>
          </select>
          {errors.role && (
            <p id="role-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${getInputClassName('password')} pr-20`}
              placeholder="Create a strong password"
              disabled={isSubmitting}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error password-strength' : 'password-strength'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                disabled={isSubmitting}
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

          {/* Password Strength Indicator */}
          {watchedPassword && (
            <div id="password-strength" className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Password Strength</span>
                <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                  <div key={key} className="flex items-center">
                    {met ? (
                      <Check className="h-3 w-3 text-green-500 mr-1" aria-hidden="true" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400 mr-1" aria-hidden="true" />
                    )}
                    <span className={met ? 'text-green-700' : 'text-gray-500'}>
                      {key === 'length' && '8+ characters'}
                      {key === 'uppercase' && 'Uppercase letter'}
                      {key === 'lowercase' && 'Lowercase letter'}
                      {key === 'number' && 'Number'}
                      {key === 'special' && 'Special character'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${getInputClassName('confirmPassword')} pr-20`}
              placeholder="Confirm your password"
              disabled={isSubmitting}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                disabled={isSubmitting}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <div className="pr-3 flex items-center pointer-events-none">
                {getFieldIcon('confirmPassword')}
              </div>
            </div>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('acceptTerms')}
              id="acceptTerms"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={isSubmitting}
              aria-invalid={errors.acceptTerms ? 'true' : 'false'}
              aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                Privacy Policy
              </Link>
              <span className="text-red-500" aria-label="required"> *</span>
            </label>
            {errors.acceptTerms && (
              <p id="acceptTerms-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>
        </div>

        {/* Global Error Message */}
        {errors.root && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200" role="alert" aria-live="polite">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                <p className="mt-1 text-sm text-red-700">{errors.root.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isSubmitting && 'Creating account, please wait...'}
          {errors.root && `Registration error: ${errors.root.message}`}
        </div>
      </form>
    </div>
  );
}