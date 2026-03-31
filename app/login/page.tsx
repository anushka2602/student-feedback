'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setUser } from '@/lib/auth'
import Link from 'next/link'

const roleConfig = {
  student: { color: '#DB1A1A', label: 'Student' },
  teacher: { color: '#2C687B', label: 'Teacher' },
  admin: { color: '#8CC7C4', label: 'Admin' },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') || 'student') as 'student' | 'teacher' | 'admin'
  const config = roleConfig[role]

  const [displayId, setDisplayId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('display_id', displayId.trim())
      .eq('password', password)
      .eq('role', role)
      .single()

    if (dbError || !data) {
      setError('Incorrect ID or password. Please check and try again.')
      setLoading(false)
      return
    }

    setUser(data)
    if (role === 'teacher') router.push('/teacher')
    else if (role === 'admin') router.push('/admin')
    else router.push('/feedback')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FFF6F6' }}>

      {/* Left decorative panel */}
      <div className="hidden md:flex flex-col justify-between p-10 w-2/5" style={{ background: config.color }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">Feedback Portal</span>
        </div>

        <div>
          <p className="font-display text-5xl font-bold text-white leading-none mb-4">
            {config.label}<br />Login
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {role === 'student' && 'Rate your teachers and share your experience to help improve the institution.'}
            {role === 'teacher' && 'View your anonymous student ratings and feedback to grow professionally.'}
            {role === 'admin' && 'Access the full dashboard with all student feedback and analytics.'}
          </p>
        </div>

        <div className="flex gap-2">
          {['student', 'teacher', 'admin'].map(r => (
            <div key={r} className="h-1.5 rounded-full flex-1" style={{ background: r === role ? 'white' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full" style={{ maxWidth: '400px' }}>

          <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: '#8CC7C4' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            All roles
          </Link>

          {/* Mobile role badge */}
          <div className="md:hidden inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4" style={{ background: config.color, color: 'white' }}>
            {config.label}
          </div>

          <h2 className="font-display text-3xl font-bold mb-1" style={{ color: '#2C687B' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: '#8CC7C4' }}>Enter your assigned credentials below</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C687B' }}>Your ID</label>
              <input
                type="text"
                value={displayId}
                onChange={e => setDisplayId(e.target.value)}
                placeholder="e.g. STU001"
                required
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{ border: '2px solid #e8e8e8', color: '#2C687B', fontFamily: 'DM Sans, sans-serif', background: 'white' }}
                onFocus={e => e.target.style.borderColor = config.color}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C687B' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all pr-16"
                  style={{ border: '2px solid #e8e8e8', color: '#2C687B', fontFamily: 'DM Sans, sans-serif', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = config.color}
                  onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: '#8CC7C4' }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: '#FFF6F6', border: '1.5px solid #fde8e8' }}>
                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: '#DB1A1A' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{ background: config.color, fontFamily: 'DM Sans, sans-serif' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                  Signing in...
                </span>
              ) : `Sign in as ${config.label}`}
            </button>
          </form>

          <div className="mt-6 pt-6 flex flex-col gap-3 items-center" style={{ borderTop: '1px solid #f0f0f0' }}>
            <Link href={`/forgot-credentials?role=${role}`} className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#2C687B' }}>
              Forgot your credentials?
            </Link>
            <Link href="/change-password" className="text-sm transition-colors hover:opacity-70" style={{ color: '#8CC7C4' }}>
              Change password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6F6' }}>
        <p style={{ color: '#2C687B' }}>Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}