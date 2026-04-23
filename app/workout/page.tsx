'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WorkoutBuilder() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isPro, setIsPro] = useState(false)
  const [goalLimitHit, setGoalLimitHit] = useState(false)
  const totalSteps = 4

  const [form, setForm] = useState({
    age: '',
    sex: '',
    weight: '',
    fitnessLevel: '',
    goals: [] as string[],
    muscleGroups: [] as string[],
    daysPerWeek: '',
    sessionLength: '',
    equipment: '',
    injuries: '',
    preferredStyle: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('subscribers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (data) setIsPro(true)

        const supplementForm = localStorage.getItem('stackForm')
        if (supplementForm) {
          const parsed = JSON.parse(supplementForm)
          setForm(prev => ({
            ...prev,
            age: parsed.age || '',
            sex: parsed.sex || '',
            weight: parsed.weight || '',
          }))
        }
      }
    }
    init()
  }, [])

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleArray = (field: 'goals' | 'muscleGroups', value: string, limit?: number) => {
    setForm(prev => {
      const arr = prev[field]
      if (arr.includes(value)) {
        setGoalLimitHit(false)
        return { ...prev, [field]: arr.filter(v => v !== value) }
      }
      if (limit && !isPro && arr.length >= limit) {
        setGoalLimitHit(true)
        return prev
      }
      return { ...prev, [field]: [...arr, value] }
    })
  }

  const workoutGoals = ['Build muscle', 'Lose fat', 'Improve endurance', 'Increase strength', 'Improve mobility', 'Athletic performance']
  const muscleGroupOptions = ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes', 'Full body']

  const handleBuild = () => {
    localStorage.setItem('workoutForm', JSON.stringify(form))
    router.push('/workout/results')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-green-400 text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-gray-600 text-sm">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div className="bg-green-400 h-1 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">About you</h2>
            <p className="text-gray-400 mb-8">We have pre-filled what we know from your supplement profile.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input type="number" placeholder="e.g. 25" value={form.age} onChange={e => updateForm('age', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Biological sex</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Male', 'Female'].map(o => (
                    <button key={o} onClick={() => updateForm('sex', o)} className={`py-3 rounded-xl border font-medium transition-colors ${form.sex === o ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input type="number" placeholder="e.g. 75" value={form.weight} onChange={e => updateForm('weight', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fitness level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map(o => (
                    <button key={o} onClick={() => updateForm('fitnessLevel', o)} className={`py-3 rounded-xl border font-medium transition-colors ${form.fitnessLevel === o ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{o}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Your goals</h2>
            <p className="text-gray-400 mb-4">{isPro ? 'Select all that apply.' : 'Free plan: pick 1 goal. Upgrade for unlimited.'}</p>

            {goalLimitHit && (
              <div className="bg-green-400/10 border border-green-400/30 rounded-xl px-4 py-4 mb-4">
                <p className="text-green-400 text-sm font-medium mb-1">Multiple goals is a Pro feature</p>
                <p className="text-gray-400 text-xs mb-3">Upgrade to unlock unlimited goals.</p>
                <a href="/api/upgrade" className="inline-block bg-green-400 text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-300 transition-colors">Upgrade to Pro - 14.99/month</a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-8">
              {workoutGoals.map(g => (
                <button key={g} onClick={() => toggleArray('goals', g, 1)} className={`py-4 px-4 rounded-xl border font-medium text-left transition-colors ${form.goals.includes(g) ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{g}</button>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-2">Muscle groups to focus on</h3>
            <p className="text-gray-400 text-sm mb-4">Select all you want to prioritise.</p>
            <div className="grid grid-cols-2 gap-3">
              {muscleGroupOptions.map(g => (
                <button key={g} onClick={() => toggleArray('muscleGroups', g)} className={`py-3 px-4 rounded-xl border font-medium text-left transition-colors ${form.muscleGroups.includes(g) ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{g}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Your schedule</h2>
            <p className="text-gray-400 mb-8">Tell us how much time you have.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Days per week</label>
                <div className="grid grid-cols-4 gap-3">
                  {['2', '3', '4', '5+'].map(o => (
                    <button key={o} onClick={() => updateForm('daysPerWeek', o)} className={`py-3 rounded-xl border font-medium transition-colors ${form.daysPerWeek === o ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{o} days</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Session length</label>
                <div className="grid grid-cols-3 gap-3">
                  {['30 mins', '45 mins', '60+ mins'].map(o => (
                    <button key={o} onClick={() => updateForm('sessionLength', o)} className={`py-3 rounded-xl border font-medium transition-colors ${form.sessionLength === o ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Equipment available</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Full gym', 'Home gym', 'Dumbbells only', 'No equipment'].map(o => (
                    <button key={o} onClick={() => updateForm('equipment', o)} className={`py-3 rounded-xl border font-medium transition-colors ${form.equipment === o ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{o}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Last few things</h2>
            <p className="text-gray-400 mb-8">Help us personalise your plan further.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Training style preference</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Hypertrophy (muscle size)', 'Strength (heavy lifts)', 'Circuit training', 'Let AI decide'].map(o => (
                    <button key={o} onClick={() => updateForm('preferredStyle', o)} className={`py-3 px-3 rounded-xl border font-medium text-sm transition-colors ${form.preferredStyle === o ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Any injuries or areas to avoid?</label>
                <textarea placeholder="e.g. bad knees, shoulder injury... or type none" value={form.injuries} onChange={e => updateForm('injuries', e.target.value)} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors resize-none" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">Back</button>
          ) : <div />}
          {step < totalSteps ? (
            <button onClick={() => setStep(s => s + 1)} className="bg-green-400 text-black font-semibold px-8 py-3 rounded-xl hover:bg-green-300 transition-colors">Continue</button>
          ) : (
            <button onClick={handleBuild} className="bg-green-400 text-black font-semibold px-8 py-3 rounded-xl hover:bg-green-300 transition-colors">Build my workout</button>
          )}
        </div>

      </div>
    </main>
  )
}
