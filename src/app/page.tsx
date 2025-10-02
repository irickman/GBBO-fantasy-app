import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login page - users must authenticate first
  // Force deployment
  redirect('/login')
}
// Force redeploy - middleware fully removed
