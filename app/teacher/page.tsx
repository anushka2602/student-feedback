'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TEACHER_FACTORS } from '@/lib/constants'
import Link from 'next/link'

interface FeedbackRow {
  factor: string
  rating: number
  comment: string
}
const ALL_FACTORS = [...TEACHER_FACTORS, 'Overall Rating']

export default function TeacherDashboard() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherName, setTeacherName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getUser()
    if (!user || user.role !== 'teacher') {
      router.push('/')
      return
    }
    setTeacherName(user.name)
    fetchFeedback(user.name)
  }, [router])

  const fetchFeedback = async (name: string) => {
    const { data } = await supabase.from('academic_feedback').select('factor, rating, comment').eq('teacher_name', name)
    if (data) setFeedback(data)
    setLoading(false)
  }

  const getAvg = (factor: string) => {
    const rows = feedback.filter((f) => f.factor === factor)
    if (!rows.length) return null
    return (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1)
  }

  const getComments = (factor: string) => feedback.filter((f) => f.factor === factor && f.comment?.trim())

  const overallAvg = () => {
    if (!feedback.length) return null
    return (feedback.reduce((s, r) => s + r.rating, 0) / feedback.length).toFixed(1)
  }

  const initials =
    teacherName
      .split(' ')
      .filter((w) => /[A-Z]/.test(w))
      .map((w) => w[0])
      .join('')
      .slice(0, 2) || 'T'

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse-soft text-sm text-slate-500 dark:text-slate-400">Loading your feedback...</p>
      </div>
    )
  }

  const avg = overallAvg()
  const avgNum = avg ? parseFloat(avg) : 0
  const scoreColor = avgNum >= 8 ? '#2C687B' : avgNum >= 5 ? '#ea580c' : '#DB1A1A'

  return (
    <div className="min-h-screen pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <header className="glass-nav sticky top-0 z-10 px-4 sm:px-6">
        <div className="mx-auto flex min-h-14 max-w-3xl items-center justify-between py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2C687B] text-sm font-bold text-white shadow-md shadow-teal-900/25">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{teacherName}</div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Teacher Dashboard</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
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

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {avg ? (
          <div className="surface mb-8 flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <div className="shrink-0 text-center sm:text-left">
              <div className="text-5xl font-bold leading-none tabular-nums sm:text-6xl" style={{ color: scoreColor }}>
                {avg}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">/ 10 overall</div>
            </div>
            <div className="min-h-[1px] min-w-0 flex-1 border-t border-slate-100 pt-6 dark:border-slate-700 sm:border-l sm:border-t-0 sm:border-l-slate-100 sm:pl-8 sm:pt-0 dark:sm:border-l-slate-700">
              <div className="text-base font-bold text-slate-900 dark:text-slate-50 sm:text-lg">Your Average Rating</div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Based on {feedback.length} response{feedback.length !== 1 ? 's' : ''} from students
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(avgNum / 10) * 100}%`, backgroundColor: scoreColor }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {feedback.length === 0 ? (
          <div className="surface rounded-2xl px-6 py-14 text-center sm:py-16">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">No feedback yet</div>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Check back after students submit their ratings.</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {ALL_FACTORS.map((factor) => {
            const factorAvg = getAvg(factor)
            const comments = getComments(factor)
            if (!factorAvg && !comments.length) return null
            const factorAvgNum = factorAvg ? parseFloat(factorAvg) : 0
            const barColor = factorAvgNum >= 8 ? '#2C687B' : factorAvgNum >= 5 ? '#8CC7C4' : '#DB1A1A'
            const totalVotes = feedback.filter((f) => f.factor === factor).length

            return (
              <article key={factor} className="surface rounded-2xl p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{factor}</span>
                  {factorAvg ? (
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-bold tabular-nums" style={{ color: barColor }}>
                        {factorAvg}
                      </span>
                      <span className="text-sm font-medium text-slate-300 dark:text-slate-600">/10</span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {totalVotes} response{totalVotes !== 1 ? 's' : ''}
                </div>
                {factorAvg ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(factorAvgNum / 10) * 100}%`, backgroundColor: barColor }}
                    />
                  </div>
                ) : null}
                {comments.length > 0 ? (
                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-700">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Anonymous Comments</div>
                    <div className="flex flex-col gap-2">
                      {comments.map((c, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-100 bg-slate-50/90 py-3 pl-4 pr-3 text-sm text-slate-600 border-l-[3px] border-l-[#8CC7C4] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                        >
                          {c.comment}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
