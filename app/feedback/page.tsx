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
    if (!user || user.role !== 'student') {
      router.push('/')
      return
    }
    setUserName(user.name)
  }, [router])

  if (!mounted) return null

  const firstName = userName.split(' ')[0]

  return (
    <div className="min-h-screen pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="glass-nav sticky top-0 z-10 px-4 sm:px-6">
        <div className="mx-auto flex min-h-14 max-w-xl flex-wrap items-center justify-between gap-2 py-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DB1A1A] shadow-md shadow-rose-900/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Feedback Portal</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">Hi, {firstName}</span>
            <Link href="/change-password" className="btn-header-accent">
              Password
            </Link>
            <button
              type="button"
              onClick={() => {
                clearUser()
                router.push('/')
              }}
              className="btn-header-muted"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">Submit Feedback</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">All feedback is anonymous. Select a category to get started.</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push('/feedback/academic')}
            className="group surface-interactive flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-left sm:gap-5 sm:p-6 hover:border-[#DB1A1A]/30 hover:shadow-[0_20px_50px_-24px_rgba(219,26,26,0.2)] dark:border-slate-600/50 dark:bg-slate-900/70"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 transition-transform duration-200 group-hover:scale-105 dark:bg-rose-950/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-slate-900 dark:text-slate-50 sm:text-lg">Academic</div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Rate teachers across 8 factors + timetable management</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Clarity', 'Knowledge', 'Punctuality', 'Communication'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#DB1A1A] dark:bg-rose-950/50 dark:text-rose-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <svg
              className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600 dark:group-hover:text-slate-500"
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

          <button
            type="button"
            onClick={() => router.push('/feedback/non-academic')}
            className="group surface-interactive flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-left sm:gap-5 sm:p-6 hover:border-[#2C687B]/30 hover:shadow-[0_20px_50px_-24px_rgba(44,104,123,0.2)] dark:border-slate-600/50 dark:bg-slate-900/70"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 transition-transform duration-200 group-hover:scale-105 dark:bg-teal-950/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-slate-900 dark:text-slate-50 sm:text-lg">Non-Academic</div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Rate campus facilities, cleanliness, safety &amp; more</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Infrastructure', 'Wi-Fi', 'Safety', 'Hygiene'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#2C687B] dark:bg-teal-950/50 dark:text-teal-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <svg
              className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400 dark:text-slate-600 dark:group-hover:text-slate-500"
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
        </div>

        <div className="surface mt-6 flex gap-3 rounded-2xl p-4 sm:p-5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8CC7C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Rating is completely <strong className="font-semibold text-slate-800 dark:text-slate-200">optional</strong> — rate only what you want. You can rate one teacher or all of them. Submit when you&apos;re ready.
          </p>
        </div>
      </div>
    </div>
  )
}
