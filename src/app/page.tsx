import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to dashboard (which will handle auth)
  redirect('/dashboard')
}
