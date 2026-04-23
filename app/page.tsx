import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-4">
          AI-Powered Health Intelligence
        </p>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Your personal health coach, built by AI
        </h1>
        <p className="text-gray-400 text-xl mb-12 leading-relaxed">
          Get a personalised supplement stack and workout plan based on your goals, lifestyle and body. Backed by science. Updated daily.
        </p>
        <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto mb-10 sm:grid-cols-2">
          <Link href="/intake" className="bg-green-400 text-black font-semibold px-8 py-5 rounded-2xl text-lg hover:bg-green-300 transition-colors block">
            Build my supplement stack
          </Link>
          <Link href="/workout" className="bg-gray-900 border border-gray-700 text-white font-semibold px-8 py-5 rounded-2xl text-lg hover:border-gray-500 transition-colors block">
            Build my workout plan
          </Link>
        </div>
        <p className="text-gray-600 text-sm">
          Takes 5 minutes · Backed by science · Free to start
        </p>
      </div>
    </main>
  )
}
