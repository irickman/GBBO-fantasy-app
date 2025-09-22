import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import authConfig from '@/config/auth'

export async function authGuard() {
  const session = await getIronSession(cookies(), {
    cookieName: authConfig.IRON_SESSION_COOKIE_NAME,
    password: authConfig.IRON_SESSION_PASSWORD,
  })
  return Boolean(session.auth?.loggedIn)
}

export async function getSession() {
  const session = await getIronSession(cookies(), {
    cookieName: authConfig.IRON_SESSION_COOKIE_NAME,
    password: authConfig.IRON_SESSION_PASSWORD,
  })
  return session
}
