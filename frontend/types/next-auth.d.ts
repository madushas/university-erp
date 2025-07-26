import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      username: string // Changed from StringValidation to string
      role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
    }
    accessToken: string
    refreshToken: string
  }

  interface User {
    id: string
    name: string | null // Allow null
    email: string
    username: string
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
    username: string
    accessToken: string
    refreshToken: string
  }
}
