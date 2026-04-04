'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user) {
      if (user.role === 'teacher') router.push('/teacher')
      else if (user.role === 'admin') router.push('/admin')
      else router.push('/feedback')
    }
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex' }}>

      {/* Left — dark panel */}
      <div style={{
        width: '45%',
        background: '#2C687B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#DB1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '15px', letterSpacing: '0.02em' }}>
            Feedback Portal
          </span>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(219,26,26,0.2)',
            color: '#ff9999',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            borderRadius: '100px',
            marginBottom: '24px',
          }}>
            Academic Year 2024–25
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '3rem',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Your voice<br />shapes better<br />education.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1.7, maxWidth: '320px' }}>
            Share honest feedback about teachers, facilities, and campus life. All responses are anonymous and confidential.
          </p>
        </div>

        {/* Bottom stats */}
        <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
          {[
            { num: '100%', label: 'Anonymous' },
            { num: '9', label: 'Teachers rated' },
            { num: '8', label: 'Campus aspects' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>{s.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — role selection */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        background: '#fafafa',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
            Sign in to continue
          </h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '40px' }}>
            Select your role to access the portal
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                key: 'student', label: 'Student', desc: 'Submit feedback on teachers & campus',
                color: '#DB1A1A', lightColor: '#fff5f5',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              },
              {
                key: 'teacher', label: 'Teacher', desc: 'View your ratings & student comments',
                color: '#2C687B', lightColor: '#f0f7f8',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              },
              {
                key: 'admin', label: 'Admin', desc: 'Access all feedback & analytics',
                color: '#555', lightColor: '#f5f5f5',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              },
            ].map(role => (
              <button
                key={role.key}
                onClick={() => router.push(`/login?role=${role.key}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '18px 20px', borderRadius: '12px',
                  background: 'white', border: '1.5px solid #eaeaea',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = role.color
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.08)`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#eaeaea'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: role.lightColor, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e' }}>{role.label}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{role.desc}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: '#bbb', fontSize: '12px', marginTop: '32px' }}>
            Use your institution-assigned credentials to sign in
          </p>
        </div>
      </div>

    </div>
  )
}