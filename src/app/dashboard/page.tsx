import { authGuard } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const isAuthenticated = await authGuard()
  
  if (!isAuthenticated) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-6">
            🧁 GBBO Fantasy Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">
                Current Leaderboard
              </h2>
              <p className="text-amber-600">View current standings</p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">
                Enter Scores
              </h2>
              <p className="text-amber-600">Add weekly scores</p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">
                Manage Contestants
              </h2>
              <p className="text-amber-600 mb-3">Upload contestants & assign teams</p>
              <Link
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                href="/admin/contestants"
              >
                Open
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <form action="/api/auth/logout" method="post">
              <button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Leave the Tent
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
