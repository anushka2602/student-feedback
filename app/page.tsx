'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'

const roles = [
  {
    key: 'student',
    label: 'Student',
    desc: 'Submit feedback on teachers & campus',
    color: '#DB1A1A',
    light: 'bg-rose-50 dark:bg-rose-950/45',
    ringHover: 'hover:border-[#DB1A1A]/35 hover:shadow-[0_20px_50px_-20px_rgba(219,26,26,0.25)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    key: 'teacher',
    label: 'Teacher',
    desc: 'View your ratings & student comments',
    color: '#2C687B',
    light: 'bg-teal-50 dark:bg-teal-950/40',
    ringHover: 'hover:border-[#2C687B]/35 hover:shadow-[0_20px_50px_-20px_rgba(44,104,123,0.22)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    key: 'admin',
    label: 'Admin',
    desc: 'Access all feedback & analytics',
    color: '#475569',
    light: 'bg-slate-100 dark:bg-slate-800/80',
    ringHover: 'hover:border-slate-400/40 hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
] as const

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
    <div className="fade-in flex min-h-screen flex-col bg-white lg:flex-row lg:bg-transparent dark:bg-slate-950 lg:dark:bg-transparent">
      {/* Hero */}
      <aside className="relative order-2 lg:order-1 flex flex-col justify-between overflow-hidden px-8 py-10 sm:px-12 sm:py-12 lg:w-[44%] lg:min-h-screen lg:shrink-0 bg-gradient-to-br from-[#0f3d4d] via-[#1e5a6b] to-[#2C687B] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#DB1A1A]/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DB1A1A] shadow-lg shadow-black/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/95">Feedback Portal</span>
        </div>

        <div className="relative my-10 lg:my-0">
          <span className="mb-5 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-100/90 backdrop-blur-sm">
            Academic Year 2024–25
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem]">
            Your voice
            <br />
            shapes better
            <br />
            education.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">
            Share honest feedback about teachers, facilities, and campus life. All responses are anonymous and confidential.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-8 sm:gap-10">
          {[
            { num: '100%', label: 'Anonymous' },
            { num: '9', label: 'Teachers rated' },
            { num: '8', label: 'Campus aspects' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold tabular-nums text-white sm:text-2xl">{s.num}</div>
              <div className="mt-0.5 text-xs font-medium text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Roles */}
      <main className="order-1 flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10 sm:py-12 lg:order-2 lg:px-16">
        <div className="w-full max-w-[400px]">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-[1.65rem]">Sign in to continue</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Select your role to access the portal</p>

          <div className="mt-10 flex flex-col gap-3">
            {roles.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => router.push(`/login?role=${role.key}`)}
                className={`group surface-interactive flex w-full min-h-[3.25rem] items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 text-left dark:border-slate-600/50 dark:bg-slate-900/70 ${role.ringHover}`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${role.light} transition-transform duration-200 group-hover:scale-105`}
                >
                  {role.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{role.label}</div>
                  <div className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{role.desc}</div>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600 dark:group-hover:text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">Use your institution-assigned credentials to sign in</p>
        </div>
      </main>
    </div>
  )
}
