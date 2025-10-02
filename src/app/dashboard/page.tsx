import { redirect } from 'next/navigation'
import { authGuard } from '@/lib/auth'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const isAuthenticated = await authGuard()
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  return <DashboardClient />
}

