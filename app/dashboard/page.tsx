'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Stack {
  id: string
  created_at: string
  stack_data: {
    summary: string
    supplements: { name: string }[]
  }
  form_data: {
    goals: string[]
  }
}

interface Workout {
  id: string
  created_at: string
  workout_data: {
    summary: string
    weeklyPlan: { day: string; focus: string }[]
  }
  form_data: {
    goals: string[]
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [stacks, setStacks] = useState<Stack[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [activeTab, setActiveTab] = useState<'stacks' | 'workouts'>('stacks')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserEmail(user.email || '')

      const { data: sub } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
      if (sub) setIsPro(true)

      const { data: stackData } = await supabase.from('stacks').select('*').order('created_at', { ascending: false })
      if (stackData) setStacks(stackData)

      const { data: workoutData } = await supabase.from('workouts').select('*').order('created_at', { ascending: false })
      if (workoutData) setWorkouts(workoutData)

      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-1">Dashboard</p>
            <h1 className="text-3xl font-bold">Your plans</h1>
            <p className="text-gray-500 text-sm mt-1">{userEmail}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSignOut} className="border border-gray-700 text-gray-400 px-4 py-2 rounded-xl hover:border-gray-500 transition-colors text-sm">Sign out</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button onClick={() => router.push('/intake')} className="bg-green-400 text-black font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors text-sm">New supplement stack</button>
          <button onClick={() => router.push('/workout')} className="bg-gray-900 border border-gray-700 text-white font-semibold py-3 rounded-xl hover:border-gray-500 transition-colors text-sm">New workout plan</button>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('stacks')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'stacks' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-gray-300'}`}>Supplement stacks</button>
          <button onClick={() => setActiveTab('workouts')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'workouts' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-gray-300'}`}>Workout plans</button>
        </div>

        {activeTab === 'stacks' && (
          <div className="space-y-4">
            {stacks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg mb-6">No saved stacks yet</p>
                <button onClick={() => router.push('/intake')} className="bg-green-400 text-black font-semibold px-8 py-4 rounded-xl hover:bg-green-300 transition-colors">Build your first stack</button>
              </div>
            ) : stacks.map((stack) => (
              <div key={stack.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(stack.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-white font-medium">{stack.stack_data.supplements.length} supplements</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {stack.form_data.goals?.slice(0, 2).map((goal: string) => (
                      <span key={goal} className="bg-green-400/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-400/20">{goal}</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{stack.stack_data.summary}</p>
                <div className="flex gap-2 flex-wrap">
                  {stack.stack_data.supplements.map((supp) => (
                    <span key={supp.name} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">{supp.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg mb-6">No saved workouts yet</p>
                <button onClick={() => router.push('/workout')} className="bg-green-400 text-black font-semibold px-8 py-4 rounded-xl hover:bg-green-300 transition-colors">Build your first workout</button>
              </div>
            ) : workouts.map((workout) => (
              <div key={workout.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(workout.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-white font-medium">{workout.workout_data.weeklyPlan.filter(d => d.focus !== 'Rest & Recovery').length} training days/week</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {workout.form_data.goals?.slice(0, 2).map((goal: string) => (
                      <span key={goal} className="bg-green-400/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-400/20">{goal}</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{workout.workout_data.summary}</p>
                <div className="flex gap-2 flex-wrap">
                  {workout.workout_data.weeklyPlan.map((day) => (
                    <span key={day.day} className={`text-xs px-3 py-1 rounded-full ${day.focus === 'Rest & Recovery' ? 'bg-gray-800 text-gray-500' : 'bg-gray-800 text-gray-300'}`}>{day.day}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPro && (
          <div className="mt-8 bg-gray-900 border border-green-400/30 rounded-2xl p-6">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-2">Upgrade to Pro</p>
            <p className="text-white font-bold text-lg mb-2">Unlock daily coaching</p>
            <p className="text-gray-400 text-sm mb-4">Daily check-ins, AI adaptation, progress tracking, streaks, reminders and more.</p>
            <button onClick={() => router.push('/api/upgrade')} className="w-full bg-green-400 text-black font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors">Upgrade to Pro - 14.99/month</button>
          </div>
        )}

      </div>
    </main>
  )
}
