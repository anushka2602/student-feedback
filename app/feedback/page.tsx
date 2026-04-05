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
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* Top nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #eaeaea', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#DB1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Feedback Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#888', marginRight: '8px' }}>Hi, {userName.split(' ')[0]}</span>
            <Link href="/change-password" style={{ fontSize: '12px', color: '#2C687B', textDecoration: 'none', fontWeight: 500, padding: '6px 12px', borderRadius: '8px', border: '1px solid #e0f0f2', background: '#f0f9fa' }}>
              Password
            </Link>
            <button onClick={() => { clearUser(); router.push('/') }} style={{ fontSize: '12px', color: '#888', background: 'none', border: '1px solid #eee', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
            Submit Feedback
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            All feedback is anonymous. Select a category to get started.
          </p>
        </div>

        {/* Category cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Academic */}
          <button
            onClick={() => router.push('/feedback/academic')}
            style={{
              background: 'white', border: '1px solid #eaeaea', borderRadius: '16px',
              padding: '24px', textAlign: 'left', cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', gap: '20px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#DB1A1A'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(219,26,26,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#eaeaea'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Academic</div>
              <div style={{ fontSize: '13px', color: '#888' }}>Rate teachers across 8 factors + timetable management</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {['Clarity', 'Knowledge', 'Punctuality', 'Communication'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#DB1A1A', background: '#fff5f5', padding: '3px 8px', borderRadius: '100px', fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Non-Academic */}
          <button
            onClick={() => router.push('/feedback/non-academic')}
            style={{
              background: 'white', border: '1px solid #eaeaea', borderRadius: '16px',
              padding: '24px', textAlign: 'left', cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', gap: '20px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2C687B'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(44,104,123,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#eaeaea'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f0f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Non-Academic</div>
              <div style={{ fontSize: '13px', color: '#888' }}>Rate campus facilities, cleanliness, safety & more</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {['Infrastructure', 'Wi-Fi', 'Safety', 'Hygiene'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#2C687B', background: '#f0f9fa', padding: '3px 8px', borderRadius: '100px', fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Note */}
        <div style={{ marginTop: '24px', background: 'white', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8CC7C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
            Rating is completely <strong style={{ color: '#1a1a2e' }}>optional</strong> — rate only what you want. You can rate one teacher or all of them. Submit when you&apos;re ready.
          </p>
        </div>
      </div>
    </div>
  )
}