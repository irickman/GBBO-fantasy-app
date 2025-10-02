import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import authConfig from '../../../../config/auth'

// CRITICAL: Trim session config to match middleware
const IRON_SESSION_COOKIE_NAME = (process.env.IRON_SESSION_COOKIE_NAME || authConfig.IRON_SESSION_COOKIE_NAME).trim()
const IRON_SESSION_PASSWORD = (process.env.IRON_SESSION_PASSWORD || authConfig.IRON_SESSION_PASSWORD).trim()
const AUTH_PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH || authConfig.AUTH_PASSWORD_HASH

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

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (typeof password !== 'string' || !password) {
      return new Response('Bad Request', { status: 400 })
    }

    const ok = await bcrypt.compare(password, AUTH_PASSWORD_HASH)
    
    // Add jitter to prevent timing attacks
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 250))

    if (!ok) {
      return new Response('Unauthorized', { status: 401 })
    }

    const session = await getIronSession(cookies(), sessionOptions)
    const sessionData = session as any
    sessionData.auth = { loggedIn: true, at: Date.now() }
    await session.save()
    
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error('login error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}
