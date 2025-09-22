import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import authConfig from '@/config/auth'

export async function POST() {
  const session = await getIronSession(cookies(), {
    cookieName: authConfig.IRON_SESSION_COOKIE_NAME,
    password: authConfig.IRON_SESSION_PASSWORD,
  })
  session.destroy()
  return new Response(null, { status: 204 })
}
