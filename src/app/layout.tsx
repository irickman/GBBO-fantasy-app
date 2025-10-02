import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { authGuard } from '@/lib/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GBBO Fantasy League',
  description: 'Track your Great British Bake Off fantasy league scores',
}

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/login']

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current pathname from headers
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || '/'
  
  console.log('[LAYOUT] Checking auth for pathname:', pathname)
  
  // Only check auth for non-public paths
  const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/login')
  
  console.log('[LAYOUT] Is public path:', isPublicPath)
  
  if (!isPublicPath) {
    const isAuthenticated = await authGuard()
    console.log('[LAYOUT] Is authenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('[LAYOUT] Redirecting to /login')
      redirect('/login')
    }
  }
  
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

