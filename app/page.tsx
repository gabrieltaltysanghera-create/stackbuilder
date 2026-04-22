export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-4">
          AI-Powered Supplement Intelligence
        </p>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Your perfect supplement stack, built for you
        </h1>
        <p className="text-gray-400 text-xl mb-10 leading-relaxed">
          Answer a few questions about your health, diet, and goals. Our AI analyses your profile against the latest research and builds your personalised protocol.
        </p>
        <a href="/intake" className="bg-green-400 text-black font-semibold px-8 py-4 rounded-full text-lg hover:bg-green-300 transition-colors inline-block">
  Build my stack →
</a>
        <p className="text-gray-600 text-sm mt-6">
          Takes 5 minutes · Backed by science · Free to start
        </p>
      </div>
    </main>
  )
}