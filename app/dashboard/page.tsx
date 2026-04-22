'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Supplement {
  name: string
  dose: string
  timing: string
  reason: string
  warning?: string | null
}

interface Stack {
  id: string
  created_at: string
  stack_data: {
    summary: string
    supplements: Supplement[]
  }
  form_data: {
    goals: string[]
    diet: string
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [stacks, setStacks] = useState<Stack[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUserEmail(user.email || '')

      const { data, error } = await supabase
        .from('stacks')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setStacks(data)
      }
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

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-1">Dashboard</p>
            <h1 className="text-3xl font-bold">Your stacks</h1>
            <p className="text-gray-500 text-sm mt-1">{userEmail}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/intake')}
              className="bg-green-400 text-black font-semibold px-5 py-2 rounded-xl hover:bg-green-300 transition-colors text-sm"
            >
              New stack →
            </button>
            <button
              onClick={handleSignOut}
              className="border border-gray-700 text-gray-400 px-5 py-2 rounded-xl hover:border-gray-500 transition-colors text-sm"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stacks list */}
        {stacks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-6">No saved stacks yet</p>
            <button
              onClick={() => router.push('/intake')}
              className="bg-green-400 text-black font-semibold px-8 py-4 rounded-xl hover:bg-green-300 transition-colors"
            >
              Build your first stack →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {stacks.map((stack) => (
              <div key={stack.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(stack.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-white font-medium">
                      {stack.stack_data.supplements.length} supplements
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {stack.form_data.goals?.slice(0, 2).map((goal: string) => (
                      <span key={goal} className="bg-green-400/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-400/20">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {stack.stack_data.summary}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2 flex-wrap">
                  {stack.stack_data.supplements.map((supp) => (
                    <span key={supp.name} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      {supp.name}
                    </span>
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