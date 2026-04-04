'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setUser } from '@/lib/auth'
import Link from 'next/link'

const roleConfig = {
  student: { color: '#DB1A1A', label: 'Student', bg: '#2C687B' },
  teacher: { color: '#2C687B', label: 'Teacher', bg: '#1a4a5a' },
  admin: { color: '#333', label: 'Admin', bg: '#222' },
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
      .from('users').select('*')
      .eq('display_id', displayId.trim())
      .eq('password', password)
      .eq('role', role)
      .single()

    if (dbError || !data) {
      setError('Incorrect ID or password. Please try again.')
      setLoading(false)
      return
    }

    setUser(data)
    if (role === 'teacher') router.push('/teacher')
    else if (role === 'admin') router.push('/admin')
    else router.push('/feedback')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'white' }}>

      {/* Left photo panel */}
      <div style={{
        width: '42%',
        background: config.bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden md:flex md:flex-col">
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DB1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Feedback Portal</span>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '48px', color: 'rgba(255,255,255,0.15)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '16px' }}>&ldquo;</div>
          <p style={{ color: 'white', fontSize: '20px', fontWeight: 600, lineHeight: 1.5, marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>
            {role === 'student' && 'Your honest feedback makes our institution better for everyone.'}
            {role === 'teacher' && 'Growth starts with understanding how your students experience your teaching.'}
            {role === 'admin' && 'Data-driven decisions begin with honest student feedback.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>
                {role === 'student' ? 'S' : role === 'teacher' ? 'T' : 'A'}
              </span>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{config.label} Login</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Secure & Anonymous</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          {['student', 'teacher', 'admin'].map(r => (
            <div key={r} style={{
              height: '3px', flex: 1, borderRadius: '2px',
              background: r === role ? 'white' : 'rgba(255,255,255,0.2)',
            }} />
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fafafa' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px', textDecoration: 'none', marginBottom: '36px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to roles
          </Link>

          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'inline-block', background: config.color,
              color: 'white', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: '100px', marginBottom: '16px',
            }}>
              {config.label}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Welcome back</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>Enter your assigned credentials below</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '8px' }}>
                Your ID
              </label>
              <input
                type="text"
                value={displayId}
                onChange={e => setDisplayId(e.target.value)}
                placeholder="e.g. STU001"
                required
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '8px' }}>
                Password
              </label>
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
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#aaa', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: '13px', color: '#DB1A1A', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                background: loading ? '#ccc' : config.color,
                color: 'white', fontWeight: 600, fontSize: '14px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif', marginTop: '4px',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Signing in...' : `Sign in as ${config.label}`}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Link href={`/forgot-credentials?role=${role}`} style={{ fontSize: '13px', color: '#2C687B', textDecoration: 'none', fontWeight: 500 }}>
              Forgot your credentials?
            </Link>
            <Link href="/change-password" style={{ fontSize: '13px', color: '#aaa', textDecoration: 'none' }}>
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#888' }}>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}