import { redirect } from 'next/navigation'
import { authGuard } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await authGuard()
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  return <>{children}</>
}

