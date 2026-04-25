'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkUser()
  }, [pathname])

  if (pathname === '/auth') return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-white font-bold text-lg">
          Stack<span className="text-green-400">Builder</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/intake')} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === '/intake' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>Supplements</button>
          <button onClick={() => router.push('/workout')} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === '/workout' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>Workout</button>
          {isLoggedIn && (
            <button onClick={() => router.push('/checkin')} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === '/checkin' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>Check-in</button>
          )}
          {isLoggedIn && (
            <button onClick={() => router.push('/adapt')} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === '/adapt' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>Adapt</button>
          )}
          {isLoggedIn && (
            <button onClick={() => router.push('/bloodwork')} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === '/bloodwork' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>Bloodwork</button>
          )}
          {isLoggedIn ? (
            <button onClick={() => router.push('/dashboard')} className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${pathname === '/dashboard' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-white hover:border-gray-500'}`}>Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth')} className="text-sm px-4 py-1.5 rounded-lg font-medium bg-green-400 text-black hover:bg-green-300 transition-colors">Sign in</button>
          )}
        </div>
      </div>
    </nav>
  )
}
