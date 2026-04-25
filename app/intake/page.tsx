'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Intake() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goalLimitHit, setGoalLimitHit] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [form, setForm] = useState({
    age: '',
    sex: '',
    weight: '',
    goals: [] as string[],
    diet: '',
    sleep: '',
    sunlight: '',
    exercise: '',
    stress: '',
    medications: '',
    budget: '',
  })

  const totalSteps = 4

  useEffect(() => {
    const checkPro = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('subscribers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (data) setIsPro(true)
      }
    }
    checkPro()
  }, [])

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleGoal = (goal: string) => {
    setForm(prev => {
      const alreadySelected = prev.goals.includes(goal)
      if (alreadySelected) {
        setGoalLimitHit(false)
        return { ...prev, goals: prev.goals.filter(g => g !== goal) }
      }
      if (!isPro && prev.goals.length >= 1) {
        setGoalLimitHit(true)
        return prev
      }
      return { ...prev, goals: [...prev.goals, goal] }
    })
  }

  const goals = [
    'More energy', 'Better sleep', 'Build muscle', 'Lose weight',
    'Improve focus', 'Reduce stress', 'Immune support', 'Longevity',
  ]

  const handleBuildStack = () => {
    localStorage.setItem('stackForm', JSON.stringify(form))
    router.push('/results')
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
            <h2 className="text-3xl font-bold mb-2">Basic information</h2>
            <p className="text-gray-400 mb-8">This helps us personalise your dosing and recommendations.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input type="number" placeholder="e.g. 32" value={form.age} onChange={e => updateForm('age', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Biological sex</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Male', 'Female'].map(option => (
                    <button key={option} onClick={() => updateForm('sex', option)} className={`py-3 rounded-xl border font-medium transition-colors ${form.sex === option ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{option}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input type="number" placeholder="e.g. 75" value={form.weight} onChange={e => updateForm('weight', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">What are your goals?</h2>
            <p className="text-gray-400 mb-4">{isPro ? 'Select everything that applies.' : 'Free plan: pick 1 goal. Upgrade to Pro for unlimited goals.'}</p>

            {goalLimitHit && (
              <div className="bg-green-400/10 border border-green-400/30 rounded-xl px-4 py-4 mb-4">
                <p className="text-green-400 text-sm font-medium mb-1">Multiple goals is a Pro feature</p>
                <p className="text-gray-400 text-xs mb-3">Upgrade to unlock unlimited goals and a more personalised stack.</p>
                <a href="/api/upgrade" className="inline-block bg-green-400 text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-300 transition-colors">Upgrade to Pro - 14.99/month</a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {goals.map(goal => (
                <button key={goal} onClick={() => toggleGoal(goal)} className={`py-4 px-4 rounded-xl border font-medium text-left transition-colors ${form.goals.includes(goal) ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{goal}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Your lifestyle</h2>
            <p className="text-gray-400 mb-8">Be as honest as possible - this is what makes your stack accurate.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Diet type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Omnivore', 'Vegetarian', 'Vegan', 'Keto / Low carb'].map(option => (
                    <button key={option} onClick={() => updateForm('diet', option)} className={`py-3 rounded-xl border font-medium transition-colors ${form.diet === option ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{option}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Average sleep (hours per night)</label>
                <div className="grid grid-cols-4 gap-3">
                  {['< 5', '5-6', '6-7', '7-9'].map(option => (
                    <button key={option} onClick={() => updateForm('sleep', option)} className={`py-3 rounded-xl border font-medium transition-colors ${form.sleep === option ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{option}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Daily sunlight exposure</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Almost none', '15-30 mins', '30+ mins'].map(option => (
                    <button key={option} onClick={() => updateForm('sunlight', option)} className={`py-3 rounded-xl border font-medium transition-colors ${form.sunlight === option ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{option}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exercise frequency</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Rarely', '1-2x week', '3-4x week', '5+ times week'].map(option => (
                    <button key={option} onClick={() => updateForm('exercise', option)} className={`py-3 rounded-xl border font-medium transition-colors ${form.exercise === option ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{option}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Last few things</h2>
            <p className="text-gray-400 mb-8">This helps us avoid conflicts and stay within your budget.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current medications or supplements</label>
                <textarea placeholder="e.g. Vitamin D, Metformin, birth control... or type none" value={form.medications} onChange={e => updateForm('medications', e.target.value)} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Monthly budget for supplements</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Under 30', '30-60', '60-100', 'No limit'].map(option => (
                    <button key={option} onClick={() => updateForm('budget', option)} className={`py-3 rounded-xl border font-medium transition-colors ${form.budget === option ? 'bg-green-400 text-black border-green-400' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'}`}>{option}</button>
                  ))}
                </div>
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
            <button onClick={handleBuildStack} className="bg-green-400 text-black font-semibold px-8 py-3 rounded-xl hover:bg-green-300 transition-colors">Build my stack</button>
          )}
        </div>

      </div>
    </main>
  )
}
