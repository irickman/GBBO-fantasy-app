import { NextResponse } from 'next/server'
import { authGuard } from './src/lib/auth'

export async function middleware(req: Request) {
  const url = new URL(req.url)
  const res = NextResponse.next()

  // Protect dashboard and other protected routes
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin')) {
    const ok = await authGuard()
    if (!ok) {
      return NextResponse.redirect(new URL('/login', url))
    }
  }

  return res
}

export const config = { 
  matcher: ['/((?!_next|api|static|favicon.ico|login).*)'] 
}
