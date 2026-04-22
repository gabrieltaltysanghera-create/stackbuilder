'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        const returnTo = new URLSearchParams(window.location.search).get('returnTo')
router.push(returnTo || '/dashboard')
      }
    } else {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) {
    setError(error.message)
  } else if (data.session) {
    const returnTo = new URLSearchParams(window.location.search).get('returnTo')
router.push(returnTo || '/dashboard')
  } else {
    setIsLogin(true)
    setMessage('Account created! You can now sign in.')
  }
}
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">

        <div className="mb-8 text-center">
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-3">StackBuilder AI</p>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to view your saved stacks' : 'Save and revisit your supplement protocol'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-400 text-sm">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-400 text-black font-semibold py-4 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setMessage('') }}
            className="w-full text-gray-400 text-sm hover:text-white transition-colors py-2"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 text-sm hover:text-gray-400 transition-colors"
          >
            ← Back to home
          </button>
        </div>

      </div>
    </main>
  )
}