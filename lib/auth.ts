import NextAuth, { type NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

const config = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email
          const result = await sql`
            SELECT id, email, password_hash, role, tenant_id, full_name, avatar_url
            FROM users
            WHERE email = ${credentials.email}
          `

          const user = result.rows[0]

          if (!user || !user.password_hash) {
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          )

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
            role: user.role,
            tenantId: user.tenant_id,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(config)
