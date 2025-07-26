import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import { User } from '@/types'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password
            })
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();

          return {
            id: data.user.id.toString(),
            name: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email,
            username: data.user.username,
            role: data.user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string; username: string; role: string; accessToken: string; refreshToken: string } | null }) {
      if (user) {
        token.role = user.role as User['role'] || "STUDENT"; // Default to "STUDENT" if role is undefined
        token.username = user.username || ""; // Ensure username is a string
        token.accessToken = user.accessToken || ""; // Ensure accessToken is a string
        token.refreshToken = user.refreshToken || ""; // Ensure refreshToken is a string
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = (token.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT') || "STUDENT";
      session.user.username = token.username as string || "";
      session.accessToken = token.accessToken as string || "";
      session.refreshToken = token.refreshToken as string || "";
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
