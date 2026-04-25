'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Adaptation {
  id: string
  created_at: string
  user_message: string
  ai_response: string
}

export default function AdaptPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [message, setMessage] = useState('')
  const [adaptations, setAdaptations] = useState<Adaptation[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth?returnTo=/adapt'); return }
      const { data: sub } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
      if (!sub) { router.push('/dashboard'); return }
      setIsPro(true)
      const { data } = await supabase.from('adaptations').select('*').order('created_at', { ascending: false }).limit(10)
      if (data) setAdaptations(data)
      setLoading(false)
    }
    init()
  }, [])

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const response = await fetch('/api/adapt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId: user.id }),
    })
    const data = await response.json()

    if (data.response) {
      await supabase.from('adaptations').insert({
        user_id: user.id,
        user_message: message,
        ai_response: data.response,
      })
      setAdaptations(prev => [{ id: Date.now().toString(), created_at: new Date().toISOString(), user_message: message, ai_response: data.response }, ...prev])
      setMessage('')
    }
    setSending(false)
  }

  const suggestions = [
    "I've been really tired this week",
    "I'm travelling and only have a hotel gym",
    "I've been sleeping badly for 3 days",
    "I hit all my workouts this week, ready to progress",
    "My knees have been sore lately",
    "I want to focus more on fat loss this week",
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-xl mx-auto">

        <div className="mb-8">
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-2">AI Coach</p>
          <h1 className="text-3xl font-bold mb-2">Adapt my plan</h1>
          <p className="text-gray-400 text-sm">Tell your AI coach how you are feeling or what has changed. It will read your recent check-ins and suggest specific adjustments to your supplement stack and workout plan.</p>
        </div>

        <div className="mb-4">
          <textarea
            placeholder="e.g. I have been really tired this week and skipped two workouts. What should I change?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map(s => (
            <button key={s} onClick={() => setMessage(s)} className="text-xs bg-gray-900 border border-gray-700 text-gray-400 hover:border-green-400 hover:text-green-400 px-3 py-2 rounded-lg transition-colors">{s}</button>
          ))}
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full bg-green-400 text-black font-semibold py-4 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50 mb-10"
        >
          {sending ? 'Your coach is thinking...' : 'Get AI advice'}
        </button>

        {adaptations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-300">Previous advice</h2>
            {adaptations.map(a => (
              <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-2">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-gray-400 text-sm mb-3 italic">"{a.user_message}"</p>
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{a.ai_response}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
