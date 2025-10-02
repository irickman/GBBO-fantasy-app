import { redirect } from 'next/navigation'
import { authGuard } from './auth'

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await authGuard()
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  return <>{children}</>
}

