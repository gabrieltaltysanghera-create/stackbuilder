'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BloodworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth?returnTo=/bloodwork'); return }
      const { data: sub } = await supabase.from('subscribers').select('id').eq('user_id', user.id).single()
      if (!sub) { router.push('/dashboard'); return }
      setLoading(false)
    }
    init()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
      setError('')
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setAnalyzing(true)
    setResult('')
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        const response = await fetch('/api/bloodwork-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: base64 }),
        })
        const data = await response.json()
        if (data.result) {
          setResult(data.result)
        } else {
          setError('Could not analyse the PDF. Make sure it contains blood test results.')
        }
        setAnalyzing(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setAnalyzing(false)
    }
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
      <div className="max-w-xl mx-auto">

        <div className="mb-8">
          <p className="text-green-400 text-sm font-medium tracking-widest uppercase mb-2">Pro Feature</p>
          <h1 className="text-3xl font-bold mb-2">Bloodwork analysis</h1>
          <p className="text-gray-400 text-sm leading-relaxed">Upload your blood test PDF and your AI coach will identify key deficiencies and explain exactly how they affect your supplement recommendations.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-2">What we look for</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
            {['Vitamin D', 'Vitamin B12', 'Iron / Ferritin', 'Magnesium', 'Zinc', 'Testosterone', 'Thyroid (TSH)', 'Omega-3 Index', 'Folate', 'Cortisol'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-green-400 text-xs">-</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Upload your blood test PDF</label>
          <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer" onClick={() => document.getElementById('file-input')?.click()}>
            {file ? (
              <div>
                <p className="text-green-400 font-medium mb-1">{file.name}</p>
                <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                <p className="text-gray-600 text-sm">PDF files only</p>
              </div>
            )}
            <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file || analyzing}
          className="w-full bg-green-400 text-black font-semibold py-4 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50 mb-8"
        >
          {analyzing ? 'Analysing your bloodwork...' : 'Analyse bloodwork'}
        </button>

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-green-400">Your bloodwork analysis</h3>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result}</div>
            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs mb-3">Use these insights to inform your supplement stack</p>
              <button onClick={() => router.push('/intake')} className="w-full bg-green-400 text-black font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors">Rebuild my supplement stack</button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
