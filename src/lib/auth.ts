import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import authConfig from '../../config/auth'

// CRITICAL: Trim session config to match middleware
const IRON_SESSION_COOKIE_NAME = (process.env.IRON_SESSION_COOKIE_NAME || authConfig.IRON_SESSION_COOKIE_NAME).trim()
const IRON_SESSION_PASSWORD = (process.env.IRON_SESSION_PASSWORD || authConfig.IRON_SESSION_PASSWORD).trim()

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

export async function authGuard() {
  try {
    const session = await getIronSession(cookies(), sessionOptions)
    return Boolean((session as any).auth?.loggedIn)
  } catch (error) {
    console.error('Auth guard error:', error)
    return false
  }
}

export async function getSession() {
  const session = await getIronSession(cookies(), sessionOptions)
  return session
}
