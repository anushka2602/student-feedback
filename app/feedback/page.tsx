'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import Link from 'next/link'

export default function FeedbackPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getUser()
    if (!user || user.role !== 'student') { router.push('/'); return }
    setUserName(user.name)
  }, [router])

  if (!mounted) return null

  return (
    <div className="min-h-screen" style={{ background: '#FFF6F6' }}>

      {/* Dark teal header */}
      <div style={{ background: '#2C687B' }} className="px-6 pt-10 pb-16">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#8CC7C4' }}>Student Portal</p>
              <h2 className="font-display text-2xl font-bold text-white">{userName}</h2>
            </div>
            <div className="flex gap-2">
              <Link href="/change-password" className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: '#8CC7C4', border: '1.5px solid rgba(140,199,196,0.4)' }}>
                Password
              </Link>
              <button
                onClick={() => { clearUser(); router.push('/') }}
                className="text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="px-6 -mt-8 pb-10">
        <div className="max-w-md mx-auto">

          <div className="card p-6 mb-5">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#8CC7C4' }}>Choose Category</p>
            <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#2C687B' }}>What would you like to rate?</h3>
            <p className="text-sm" style={{ color: '#8CC7C4' }}>All feedback is anonymous and helps improve your institution.</p>
          </div>

          <div className="flex flex-col gap-4">

            {/* Academic */}
            <button
              onClick={() => router.push('/feedback/academic')}
              className="group card p-5 text-left flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ borderLeft: '4px solid #DB1A1A' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF6F6' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg" style={{ color: '#2C687B' }}>Academic</p>
                <p className="text-sm" style={{ color: '#8CC7C4' }}>Teachers & timetable management</p>
              </div>
              <svg className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Non-Academic */}
            <button
              onClick={() => router.push('/feedback/non-academic')}
              className="group card p-5 text-left flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ borderLeft: '4px solid #2C687B' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#edf7f7' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg" style={{ color: '#2C687B' }}>Non-Academic</p>
                <p className="text-sm" style={{ color: '#8CC7C4' }}>Facilities, cleanliness & campus life</p>
              </div>
              <svg className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}