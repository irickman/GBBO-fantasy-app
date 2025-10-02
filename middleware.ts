import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'

// Force Edge Runtime
export const runtime = 'edge'

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/login']

// Path prefixes that should be excluded from auth checks  
const EXCLUDED_PREFIXES = ['/_next', '/favicon.ico', '/static', '/api/auth/login', '/api/auth/logout']

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
  
  // Create response and inject pathname into headers so layout can read it
  const response = NextResponse.next()
  response.headers.set('x-pathname', url.pathname)
  
  // Skip auth check for excluded paths (Next.js internals, static files, auth APIs)
  if (EXCLUDED_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
    return response
  }
  
  // Skip auth check for public paths (login page) 
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return response
  }
  
  // Auth check for API routes only (pages protected in layout.tsx)
  const isApiRoute = url.pathname.startsWith('/api')
  
  if (isApiRoute) {
    try {
      const session = await getIronSession(req, response, sessionOptions)
      const isAuthenticated = Boolean((session as any).auth?.loggedIn)
      
      if (!isAuthenticated) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    } catch (error) {
      console.error('Middleware API auth error:', error)
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  
  return response
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
