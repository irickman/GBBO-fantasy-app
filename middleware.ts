import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/login']

// Path prefixes that should be excluded from auth checks  
const EXCLUDED_PREFIXES = ['/_next', '/favicon.ico', '/static']

// Auth API routes that should be accessible without authentication
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/logout']

// Get session configuration from environment variables
// Fallback to defaults for local development
// CRITICAL: Trim values to remove any accidental whitespace/newlines
const IRON_SESSION_COOKIE_NAME = (process.env.IRON_SESSION_COOKIE_NAME || 'gbbo_session').trim()
const IRON_SESSION_PASSWORD = (process.env.IRON_SESSION_PASSWORD || 'gbbo-fantasy-league-secret-key-32chars').trim()

const sessionOptions = {
  cookieName: IRON_SESSION_COOKIE_NAME,
  password: IRON_SESSION_PASSWORD,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url)
  
  // Skip auth check for excluded paths (Next.js internals, static files)
  if (EXCLUDED_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
    return NextResponse.next()
  }
  
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return NextResponse.next()
  }
  
  // Skip auth check for public API paths
  if (PUBLIC_API_PATHS.includes(url.pathname)) {
    return NextResponse.next()
  }
  
  // Check authentication using iron-session directly with request/response
  const isApiRoute = url.pathname.startsWith('/api')
  
  try {
    const response = NextResponse.next()
    const session = await getIronSession(req, response, sessionOptions)
    const isAuthenticated = Boolean((session as any).auth?.loggedIn)
    
    if (!isAuthenticated) {
      // For API routes, return 401 Unauthorized
      if (isApiRoute) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      
      // For pages, redirect to login with return URL
      const loginUrl = new URL('/login', url.origin)
      loginUrl.searchParams.set('from', url.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    
    // On error, return appropriate response
    if (isApiRoute) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    // For pages, redirect to login
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('from', url.pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
