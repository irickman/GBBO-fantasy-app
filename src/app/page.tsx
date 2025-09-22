import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-amber-800 mb-4">
            🧁 GBBO Fantasy League 🧁
          </h1>
          <p className="text-xl text-amber-700 mb-8">
            Track your Great British Bake Off fantasy league scores
          </p>
          <div className="space-y-4">
            <Link 
              href="/login"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Enter the Tent
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
