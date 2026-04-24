'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CheckIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false)
  const [form, setForm] = useState({
    energy: 5,
    sleep_quality: 5,
    soreness: 5,
    mood: 5,
    took_supplements: false,
    completed_workout: false,
    notes: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth?returnTo=/checkin'); return }

      const { data: sub } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
      if (!sub) { router.push('/dashboard'); return }
      setIsPro(true)

      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase.from('checkins').select('*').eq('user_id', user.id).eq('date', today).single()
      if (existing) {
        setAlreadyCheckedIn(true)
        setForm({
          energy: existing.energy,
          sleep_quality: existing.sleep_quality,
          soreness: existing.soreness,
          mood: existing.mood,
          took_supplements: existing.took_supplements,
          completed_workout: existing.completed_workout,
          notes: existing.notes || '',
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    await supabase.from('checkins').upsert({
      user_id: user.id,
      date: today,
      ...form,
    })

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  const SliderInput = ({ label, field, value, emoji }: { label: string; field: string; value: number; emoji: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-300">{emoji} {label}</label>
        <span className="text-green-400 font-bold text-lg">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={e => setForm(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
        className="w-full accent-green-400"
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (saved) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Check-in saved!</h2>
          <p className="text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-xl mx-auto">

        <div className="mb-8">
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-2">Daily check-in</p>
          <h1 className="text-3xl font-bold mb-1">How are you feeling today?</h1>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          {alreadyCheckedIn && <p className="text-yellow-400 text-xs mt-2">You already checked in today — you can update your answers below.</p>}
        </div>

        <div className="space-y-4 mb-6">
          <SliderInput label="Energy level" field="energy" value={form.energy} emoji="⚡" />
          <SliderInput label="Sleep quality" field="sleep_quality" value={form.sleep_quality} emoji="🌙" />
          <SliderInput label="Muscle soreness" field="soreness" value={form.soreness} emoji="💪" />
          <SliderInput label="Mood" field="mood" value={form.mood} emoji="😊" />
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setForm(prev => ({ ...prev, took_supplements: !prev.took_supplements }))}
            className={`w-full py-4 rounded-2xl border font-medium transition-colors flex items-center justify-between px-5 ${form.took_supplements ? 'bg-green-400/10 border-green-400 text-green-400' : 'bg-gray-900 border-gray-700 text-gray-300'}`}
          >
            <span>Took my supplements today</span>
            <span className="text-xl">{form.took_supplements ? '✓' : '○'}</span>
          </button>
          <button
            onClick={() => setForm(prev => ({ ...prev, completed_workout: !prev.completed_workout }))}
            className={`w-full py-4 rounded-2xl border font-medium transition-colors flex items-center justify-between px-5 ${form.completed_workout ? 'bg-green-400/10 border-green-400 text-green-400' : 'bg-gray-900 border-gray-700 text-gray-300'}`}
          >
            <span>Completed my workout today</span>
            <span className="text-xl">{form.completed_workout ? '✓' : '○'}</span>
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">Anything else to tell your AI coach?</label>
          <textarea
            placeholder="e.g. Feeling tired today, skipped cardio. Had a big meal before training. Noticing more energy in the mornings..."
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors resize-none"
          />
          <p className="text-gray-600 text-xs mt-2">Your AI coach reads these notes when adapting your plan.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-400 text-black font-semibold py-4 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save check-in'}
        </button>

      </div>
    </main>
  )
}
