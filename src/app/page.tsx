import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login page - users must authenticate first
  redirect('/login')
}
