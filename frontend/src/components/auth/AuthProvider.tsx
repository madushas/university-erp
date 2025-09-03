'use client';

import { AuthProvider as AuthContextProvider } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}