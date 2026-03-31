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

  const roles = [
    {
      key: 'student',
      label: 'Student',
      desc: 'Submit feedback on teachers & facilities',
      bg: '#DB1A1A',
      delay: 'animate-up-delay-2',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
    {
      key: 'teacher',
      label: 'Teacher',
      desc: 'View your performance ratings',
      bg: '#2C687B',
      delay: 'animate-up-delay-3',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      ),
    },
    {
      key: 'admin',
      label: 'Admin',
      desc: 'Access all feedback & analytics',
      bg: '#8CC7C4',
      delay: 'animate-up-delay-4',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#FFF6F6' }}>

      {/* Logo + heading */}
      <div className="animate-up mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DB1A1A' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="font-display text-sm font-bold tracking-[0.15em] uppercase" style={{ color: '#2C687B' }}>
            Feedback Portal
          </span>
        </div>
        <h1 className="font-display leading-none mb-3" style={{ fontSize: '3.2rem', color: '#2C687B' }}>
          Share Your<br />
          <span style={{ color: '#DB1A1A' }}>Voice.</span>
        </h1>
        <p className="text-base" style={{ color: '#8CC7C4', maxWidth: '260px', margin: '0 auto' }}>
          Your feedback shapes a better learning environment for everyone.
        </p>
      </div>

      {/* Role cards */}
      <div className="w-full" style={{ maxWidth: '360px' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center animate-up animate-up-delay-1" style={{ color: '#8CC7C4' }}>
          Select your role to continue
        </p>

        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => router.push(`/login?role=${role.key}`)}
              className={`group flex items-center gap-4 p-5 rounded-2xl text-white text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${role.delay}`}
              style={{ background: role.bg, boxShadow: `0 8px 24px ${role.bg}40` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {role.icon}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg leading-tight">{role.label}</p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{role.desc}</p>
              </div>
              <svg className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#8CC7C4' }}>
          Use your admin-assigned credentials to sign in
        </p>
      </div>

      {/* Bottom rainbow bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #DB1A1A, #8CC7C4, #2C687B)' }} />
    </div>
  )
}