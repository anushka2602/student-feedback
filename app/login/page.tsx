'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setUser } from '@/lib/auth'
import Link from 'next/link'

const roleConfig = {
  student: { color: '#DB1A1A', label: 'Student', panelBg: '#2C687B' },
  teacher: { color: '#2C687B', label: 'Teacher', panelBg: '#1a4a5a' },
  admin:   { color: '#444',    label: 'Admin',   panelBg: '#1a1a22' },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') || 'student') as 'student' | 'teacher' | 'admin'
  const config = roleConfig[role]

  const [displayId, setDisplayId]   = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [showPass, setShowPass]     = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error: dbError } = await supabase
      .from('users').select('*')
      .eq('display_id', displayId.trim())
      .eq('password', password)
      .eq('role', role)
      .single()
    if (dbError || !data) {
      setError('Incorrect ID or password. Please try again.')
      setLoading(false); return
    }
    setUser(data)
    if (role === 'teacher') router.push('/teacher')
    else if (role === 'admin') router.push('/admin')
    else router.push('/feedback')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* Left panel — hidden on mobile */}
      <div
        className="hidden md:flex md:flex-col md:justify-between"
        style={{
          width: '42%', background: config.panelBg,
          padding: '40px', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#DB1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Feedback Portal</span>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '52px', color: 'rgba(255,255,255,0.12)', fontFamily: 'Georgia,serif', lineHeight: 1, marginBottom: '12px' }}>&ldquo;</div>
          <p style={{ color: 'white', fontSize: 'clamp(16px,2vw,20px)', fontWeight: 600, lineHeight: 1.5, marginBottom: '20px', fontFamily: 'Playfair Display,serif' }}>
            {role === 'student' && 'Your honest feedback makes our institution better for everyone.'}
            {role === 'teacher' && 'Growth starts with understanding how your students experience your teaching.'}
            {role === 'admin'   && 'Data-driven decisions begin with honest student feedback.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>
              {config.label[0]}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{config.label} Login</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Secure & Anonymous</div>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          {(['student','teacher','admin'] as const).map(r => (
            <div key={r} style={{ height: '3px', flex: 1, borderRadius: '2px', background: r === role ? 'white' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text3)', fontSize: '13px', textDecoration: 'none', marginBottom: '32px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            All roles
          </Link>

          {/* Role badge */}
          <div style={{ display: 'inline-block', background: config.color, color: 'white', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '100px', marginBottom: '16px' }}>
            {config.label}
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '28px' }}>Enter your assigned credentials below</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Your ID</label>
              <input type="text" value={displayId} onChange={e => setDisplayId(e.target.value)} placeholder="e.g. STU001" required className="input-field" />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="input-field"
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ background: loading ? 'var(--border2)' : config.color, color: 'white', marginTop: '4px' }}
            >
              {loading ? 'Signing in...' : `Sign in as ${config.label}`}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Link href={`/forgot-credentials?role=${role}`} style={{ fontSize: '14px', color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>
              Forgot your credentials?
            </Link>
            <Link href="/change-password" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text3)' }}>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}