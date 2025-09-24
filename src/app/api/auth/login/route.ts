import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcrypt'
import authConfig from '@/config/auth'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (typeof password !== 'string') {
      return new Response('Bad Request', { status: 400 })
    }

    const ok = await bcrypt.compare(password, authConfig.AUTH_PASSWORD_HASH)
    // Add jitter to prevent timing attacks
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 250))

    if (!ok) {
      return new Response('Unauthorized', { status: 401 })
    }

    const res = new Response(null, { status: 204 })
    const session = await getIronSession(cookies(), {
      cookieName: authConfig.IRON_SESSION_COOKIE_NAME,
      password: authConfig.IRON_SESSION_PASSWORD,
      cookieOptions: { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict' 
      },
    })
    (session as any).auth = { loggedIn: true, at: Date.now() }
    await session.save()
    return res
  } catch (e) {
    console.error('login error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}
