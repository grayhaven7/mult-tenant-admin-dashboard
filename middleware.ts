import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route)

  // If accessing a protected route without a session, redirect to login
  if (!isPublicRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api/auth (NextAuth API routes)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
