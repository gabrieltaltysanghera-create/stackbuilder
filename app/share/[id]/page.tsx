'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Supplement {
  name: string
  dose: string
  timing: string
  reason: string
  warning?: string | null
  study?: string | null
}

interface StackData {
  summary: string
  supplements: Supplement[]
}

export default function SharedStack() {
  const params = useParams()
  const [stack, setStack] = useState<StackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadStack = async () => {
      const { data, error } = await supabase
        .from('stacks')
        .select('stack_data, created_at')
        .eq('share_id', params.id)
        .eq('is_shared', true)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setStack(data.stack_data)
      }
      setLoading(false)
    }
    loadStack()
  }, [params.id])

  const getAmazonLink = (name: string) => {
    return 'https://www.amazon.co.uk/s?k=' + encodeURIComponent(name) + '&tag=jusscomfy05-21'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Stack not found</h2>
          <p className="text-gray-400 mb-6">This stack may have been unshared or the link is incorrect.</p>
          <a href="/" className="bg-green-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-green-300 transition-colors">Build your own stack</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-3">Shared protocol</p>
          <h1 className="text-4xl font-bold mb-4">Supplement stack</h1>
          <p className="text-gray-400 text-lg leading-relaxed">{stack?.summary}</p>
        </div>

        <div className="space-y-4 mb-10">
          {stack?.supplements.map((supp, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold">{supp.name}</h3>
                <span className="bg-green-400 text-black text-xs font-semibold px-3 py-1 rounded-full ml-4 shrink-0">{supp.dose}</span>
              </div>
              <p className="text-green-400 text-sm font-medium mb-3">Timing: {supp.timing}</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">{supp.reason}</p>
              {supp.warning && (
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3 mb-3">
                  <p className="text-yellow-400 text-xs font-medium">Warning: {supp.warning}</p>
                </div>
              )}
              <div className="flex gap-3 flex-wrap mt-2">
                <a href={getAmazonLink(supp.name)} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition-colors">Buy on Amazon</a>
                {supp.study && (
                  <a href={supp.study} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium text-green-400 hover:text-green-300 border border-green-400/30 hover:border-green-400 px-3 py-2 rounded-lg transition-colors">View research</a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-green-400/30 rounded-2xl p-6 text-center">
          <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-2">Want your own personalised stack?</p>
          <h3 className="text-xl font-bold mb-2">Built by StackBuilder AI</h3>
          <p className="text-gray-400 text-sm mb-4">Get your own AI-generated supplement stack and workout plan based on your goals, lifestyle and body.</p>
          <a href="/" className="inline-block bg-green-400 text-black font-semibold px-8 py-3 rounded-xl hover:bg-green-300 transition-colors">Build my free stack</a>
        </div>

      </div>
    </main>
  )
}
