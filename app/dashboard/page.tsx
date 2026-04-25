'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Stack {
  id: string
  created_at: string
  stack_data: { summary: string; supplements: { name: string }[] }
  form_data: { goals: string[] }
}

interface Workout {
  id: string
  created_at: string
  workout_data: { summary: string; weeklyPlan: { day: string; focus: string }[] }
  form_data: { goals: string[] }
}

interface Checkin {
  id: string
  date: string
  energy: number
  sleep_quality: number
  soreness: number
  mood: number
  took_supplements: boolean
  completed_workout: boolean
  notes: string
}

export default function Dashboard() {
  const router = useRouter()
  const [stacks, setStacks] = useState<Stack[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'stacks' | 'workouts'>('overview')
  const [streak, setStreak] = useState(0)
  const [checkedInToday, setCheckedInToday] = useState(false)

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

      const { data: checkinData } = await supabase.from('checkins').select('*').order('date', { ascending: false }).limit(30)
      if (checkinData) {
        setCheckins(checkinData)
        const today = new Date().toISOString().split('T')[0]
        setCheckedInToday(checkinData.some(c => c.date === today))
        let s = 0
        const sorted = [...checkinData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        for (let i = 0; i < sorted.length; i++) {
          const expected = new Date()
          expected.setDate(expected.getDate() - i)
          const expectedStr = expected.toISOString().split('T')[0]
          if (sorted[i]?.date === expectedStr) s++
          else break
        }
        setStreak(s)
      }

      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const chartData = checkins.slice().reverse().map(c => ({
    date: new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    Energy: c.energy,
    Sleep: c.sleep_quality,
    Mood: c.mood,
  }))

  const suppAdherence = checkins.length > 0
    ? Math.round((checkins.filter(c => c.took_supplements).length / checkins.length) * 100)
    : 0

  const workoutAdherence = checkins.length > 0
    ? Math.round((checkins.filter(c => c.completed_workout).length / checkins.length) * 100)
    : 0

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

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-1">Dashboard</p>
            <h1 className="text-3xl font-bold">Your hub</h1>
            <p className="text-gray-500 text-sm mt-1">{userEmail}</p>
          </div>
          <button onClick={handleSignOut} className="border border-gray-700 text-gray-400 px-4 py-2 rounded-xl hover:border-gray-500 transition-colors text-sm">Sign out</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => router.push('/intake')} className="bg-green-400 text-black font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors text-sm">New supplement stack</button>
          <button onClick={() => router.push('/workout')} className="bg-gray-900 border border-gray-700 text-white font-semibold py-3 rounded-xl hover:border-gray-500 transition-colors text-sm">New workout plan</button>
        </div>

        {isPro && (
          <button onClick={() => router.push('/checkin')} className={`w-full mb-6 py-3 rounded-xl font-semibold text-sm transition-colors ${checkedInToday ? 'bg-green-400/10 border border-green-400/30 text-green-400' : 'bg-green-400 text-black hover:bg-green-300'}`}>
            {checkedInToday ? 'Checked in today' : 'Daily check-in'}
          </button>
        )}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-gray-300'}`}>Overview</button>
          <button onClick={() => setActiveTab('stacks')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'stacks' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-gray-300'}`}>Stacks</button>
          <button onClick={() => setActiveTab('workouts')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'workouts' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-gray-300'}`}>Workouts</button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {isPro ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{streak}</p>
                    <p className="text-gray-500 text-xs mt-1">Day streak</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{suppAdherence}%</p>
                    <p className="text-gray-500 text-xs mt-1">Supplement adherence</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{workoutAdherence}%</p>
                    <p className="text-gray-500 text-xs mt-1">Workout adherence</p>
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Wellbeing over time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <YAxis domain={[1, 10]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="Energy" stroke="#22C55E" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Sleep" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Mood" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-3 justify-center">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block"></span>Energy</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block"></span>Sleep</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-3 h-0.5 bg-yellow-500 inline-block"></span>Mood</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-600 mb-2">No check-in data yet</p>
                    <p className="text-gray-500 text-sm">Complete daily check-ins to see your progress charts here</p>
                  </div>
                )}

                {checkins.slice(0, 5).length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Recent check-ins</h3>
                    <div className="space-y-3">
                      {checkins.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                          <p className="text-sm text-gray-400">{new Date(c.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-400">E:{c.energy}</span>
                            <span className="text-blue-400">S:{c.sleep_quality}</span>
                            <span className="text-yellow-400">M:{c.mood}</span>
                            {c.took_supplements && <span className="text-green-400">Supps</span>}
                            {c.completed_workout && <span className="text-green-400">Workout</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-900 border border-green-400/30 rounded-2xl p-6">
                <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-2">Upgrade to Pro</p>
                <p className="text-white font-bold text-lg mb-2">Unlock daily coaching</p>
                <p className="text-gray-400 text-sm mb-4">Daily check-ins, streaks, progress charts, AI adaptation and more.</p>
                <div className="grid grid-cols-2 gap-3">
  <button onClick={() => router.push('/api/upgrade')} className="bg-green-400 text-black font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors text-sm">Monthly - £14.99/mo</button>
  <button onClick={() => router.push('/api/upgrade?plan=yearly')} className="bg-gray-900 border border-green-400 text-green-400 font-semibold py-3 rounded-xl hover:bg-green-400 hover:text-black transition-colors text-sm">Yearly - £99/yr (save 45%)</button>
</div>
              </div>
            )}
          </div>
        )}

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

      </div>
    </main>
  )
}
