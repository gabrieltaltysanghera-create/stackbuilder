'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Exercise {
  name: string
  sets: string
  reps: string
  weight: string
  rest: string
  notes: string
  study?: string | null
}

interface WorkoutDay {
  day: string
  focus: string
  exercises: Exercise[]
}

interface WorkoutResult {
  summary: string
  weeklyPlan: WorkoutDay[]
  tips: string[]
}

export default function WorkoutResults() {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Analysing your fitness profile...')

  const loadingMessages = [
    'Analysing your fitness profile...',
    'Designing your workout split...',
    'Calculating sets and reps...',
    'Optimising for your goals...',
    'Almost ready...',
  ]

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < loadingMessages.length) setLoadingMessage(loadingMessages[i])
    }, 3000)

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: subData } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
          if (subData) setIsPro(true)
        }

        const stored = localStorage.getItem('workoutForm')
        if (!stored) { router.push('/workout'); return }

        const formData = JSON.parse(stored)
        const response = await fetch('/api/workout-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to generate workout')
        const data = await response.json()
        setWorkout(data)

        // Auto-save to dashboard for all logged-in users
        if (user) {
          const { error: saveError } = await supabase.from('workouts').insert({
            user_id: user.id,
            form_data: formData,
            workout_data: data,
          })
          if (!saveError) setSaved(true)
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
        console.error(err)
      } finally {
        clearInterval(interval)
        setLoading(false)
      }
    }

    init()
    return () => clearInterval(interval)
  }, [])

  const handleUpgrade = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth?returnTo=/workout/results'); return }
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user.email }),
    })
    const data = await response.json()
    if (data.url) window.location.href = data.url
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-green-400 font-medium text-lg mb-2">{loadingMessage}</p>
          <p className="text-gray-600 text-sm">This usually takes 10-20 seconds</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 font-medium text-lg mb-4">{error}</p>
          <button onClick={() => router.push('/workout')} className="bg-green-400 text-black font-semibold px-8 py-3 rounded-xl hover:bg-green-300 transition-colors">Try again</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-3">Your personalised plan</p>
          <h1 className="text-4xl font-bold mb-4">Your workout plan</h1>
          <p className="text-gray-400 text-lg leading-relaxed">{workout?.summary}</p>
          {saved && (
            <p className="text-green-400 text-sm mt-3">✓ Saved to your dashboard</p>
          )}
        </div>

        <div className="space-y-6 mb-10">
          {workout?.weeklyPlan.map((day, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{day.day}</h3>
                <span className="bg-green-400/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-400/20">{day.focus}</span>
              </div>
              <div className="space-y-3">
                {day.exercises.map((ex, j) => (
                  <div key={j} className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{ex.name}</h4>
                      {ex.study && (
                        <a href={ex.study} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:text-green-300 border border-green-400/30 px-2 py-1 rounded-lg transition-colors ml-2 shrink-0">Research</a>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center bg-gray-900 rounded-lg py-2">
                        <p className="text-xs text-gray-500 mb-1">Sets</p>
                        <p className="text-green-400 font-semibold text-sm">{ex.sets}</p>
                      </div>
                      <div className="text-center bg-gray-900 rounded-lg py-2">
                        <p className="text-xs text-gray-500 mb-1">Reps</p>
                        <p className="text-green-400 font-semibold text-sm">{ex.reps}</p>
                      </div>
                      <div className="text-center bg-gray-900 rounded-lg py-2">
                        <p className="text-xs text-gray-500 mb-1">Rest</p>
                        <p className="text-green-400 font-semibold text-sm">{ex.rest}</p>
                      </div>
                    </div>
                    {ex.weight && <p className="text-gray-500 text-xs mb-1">Starting weight: {ex.weight}</p>}
                    {ex.notes && <p className="text-gray-400 text-xs">{ex.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {workout?.tips && workout.tips.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-3">Pro tips for your plan</h3>
            <ul className="space-y-2">
              {workout.tips.map((tip, i) => (
                <li key={i} className="text-gray-400 text-sm flex gap-2">
                  <span className="text-green-400 shrink-0">-</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isPro && (
          <div className="bg-gray-900 border border-green-400/30 rounded-2xl p-6 mb-6">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-2">Upgrade to Pro</p>
            <h3 className="text-xl font-bold mb-2">Track your progress</h3>
            <p className="text-gray-400 text-sm mb-4">Save your plan, track sets and reps over time, log daily check-ins, and let the AI adapt your workout week by week.</p>
            <button onClick={handleUpgrade} className="w-full bg-green-400 text-black font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors">Upgrade to Pro - £14.99/month</button>
          </div>
        )}

        <div className="border-t border-gray-800 pt-8 space-y-3">
          <button onClick={() => router.push('/dashboard')} className="w-full bg-green-400 text-black font-semibold py-4 rounded-xl hover:bg-green-300 transition-colors">
            {saved ? '✓ View in dashboard' : 'Go to dashboard'}
          </button>
          <button onClick={() => router.push('/intake')} className="w-full bg-transparent border border-gray-700 text-gray-300 font-medium py-4 rounded-xl hover:border-gray-500 transition-colors">Build your supplement stack</button>
          <button onClick={() => router.push('/workout')} className="w-full bg-transparent border border-gray-700 text-gray-300 font-medium py-4 rounded-xl hover:border-gray-500 transition-colors">Redo workout quiz</button>
        </div>

      </div>
    </main>
  )
}