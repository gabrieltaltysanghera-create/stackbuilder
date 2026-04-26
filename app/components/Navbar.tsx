'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkUser()
  }, [pathname])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (pathname === '/auth') return null

  const navLinks = [
    { label: 'Supplements', href: '/intake', always: true },
    { label: 'Workout', href: '/workout', always: true },
    { label: 'Check-in', href: '/checkin', always: false },
    { label: 'Adapt', href: '/adapt', always: false },
    { label: 'Bloodwork', href: '/bloodwork', always: false },
  ]

  const visibleLinks = navLinks.filter(l => l.always || isLoggedIn)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => router.push('/')} className="text-white font-bold text-lg shrink-0">
          Stack<span className="text-green-400">Builder</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {visibleLinks.map(link => (
            <button key={link.href} onClick={() => router.push(link.href)} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${pathname === link.href ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>
              {link.label}
            </button>
          ))}
          {isLoggedIn ? (
            <button onClick={() => router.push('/dashboard')} className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${pathname === '/dashboard' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-white hover:border-gray-500'}`}>Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth')} className="text-sm px-4 py-1.5 rounded-lg font-medium bg-green-400 text-black hover:bg-green-300 transition-colors">Sign in</button>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn ? (
            <button onClick={() => router.push('/dashboard')} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${pathname === '/dashboard' ? 'bg-green-400 text-black' : 'bg-gray-900 border border-gray-700 text-white'}`}>Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth')} className="text-sm px-3 py-1.5 rounded-lg font-medium bg-green-400 text-black hover:bg-green-300 transition-colors">Sign in</button>
          )}
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="text-gray-400 hover:text-white p-1.5 rounded-lg border border-gray-700 transition-colors">
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 border-t border-gray-800 px-4 py-3 flex flex-col gap-1">
          {visibleLinks.map(link => (
            <button key={link.href} onClick={() => router.push(link.href)} className={`text-sm px-4 py-3 rounded-xl text-left transition-colors ${pathname === link.href ? 'text-green-400 bg-green-400/10' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`}>
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}