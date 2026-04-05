'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { TEACHERS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const ALL_ITEMS = [...TEACHERS, 'Timetable Management']

export default function AcademicPage() {
  const router = useRouter()
  const [ratedItems, setRatedItems] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getUser()
    if (!user || user.role !== 'student') {
      router.push('/')
      return
    }
    loadRated()
    const handleFocus = () => loadRated()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [router])

  const loadRated = () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('academicRatings')
    if (stored) setRatedItems(JSON.parse(stored).map((r: { teacher_name: string }) => r.teacher_name))
    else setRatedItems([])
  }

  const handleSubmit = async () => {
    const user = getUser()
    if (!user) return
    const stored = localStorage.getItem('academicRatings')
    const allRatings = stored ? JSON.parse(stored) : []
    if (allRatings.length === 0) {
      alert('Please rate at least one item before submitting.')
      return
    }
    if (!confirm('Submit all your ratings? You cannot change them after submitting.')) return
    setSubmitting(true)
    const rows: {
      student_id: string
      student_name: string
      teacher_name: string
      factor: string
      rating: number
      comment: string
    }[] = []
    for (const item of allRatings) {
      for (const f of item.factors) {
        rows.push({
          student_id: user.id,
          student_name: user.name,
          teacher_name: item.teacher_name,
          factor: f.factor,
          rating: f.rating,
          comment: f.comment || '',
        })
      }
    }
    const { error } = await supabase.from('academic_feedback').insert(rows)
    if (error) {
      alert('Error submitting. Please try again.')
      setSubmitting(false)
      return
    }
    localStorage.removeItem('academicRatings')
    setSubmitted(true)
    setSubmitting(false)
  }

  if (!mounted) return null

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-6 sm:py-12">
        <div className="surface w-full max-w-sm rounded-3xl px-6 py-10 text-center sm:px-8 sm:py-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Submitted!</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Thank you for your valuable feedback.</p>
          <button
            type="button"
            onClick={() => router.push('/feedback')}
            className="mt-8 min-h-12 w-full rounded-xl bg-[#2C687B] py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/25 transition-opacity hover:opacity-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const progress = Math.round((ratedItems.length / ALL_ITEMS.length) * 100)

  return (
    <div className="min-h-screen pb-32">
      <header className="glass-nav sticky top-0 z-10">
        <div className="mx-auto flex min-h-12 max-w-xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <button
            type="button"
            onClick={() => router.push('/feedback')}
            className="flex min-h-11 min-w-11 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="truncate text-center text-sm font-semibold text-slate-900 dark:text-slate-100">Academic</span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
            {ratedItems.length}/{ALL_ITEMS.length}
          </span>
        </div>
        <div className="h-1 bg-slate-200/80 dark:bg-slate-700/80">
          <div className="h-full bg-[#DB1A1A] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">Rate Teachers</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tap any name to rate. All factors are optional.</p>
        </div>

        <div className="flex flex-col gap-3">
          {ALL_ITEMS.map((item, i) => {
            const rated = ratedItems.includes(item)
            const isTimetable = item === 'Timetable Management'
            return (
              <button
                key={item}
                type="button"
                onClick={() => router.push(`/feedback/academic/rate?name=${encodeURIComponent(item)}`)}
                className={`surface-interactive flex min-h-[3.25rem] w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left sm:px-5 ${
                  rated
                    ? 'border-[#8CC7C4]/50 bg-white dark:border-teal-700/50 dark:bg-slate-900/80'
                    : 'border-slate-200/80 bg-white/90 dark:border-slate-600/50 dark:bg-slate-900/70'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    rated
                      ? 'bg-teal-50 text-[#2C687B] dark:bg-teal-950/50 dark:text-teal-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  } ${isTimetable ? 'text-lg' : ''}`}
                >
                  {isTimetable ? '📅' : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item}</div>
                  {!isTimetable ? <div className="text-xs text-slate-400 dark:text-slate-500">8 rating factors</div> : null}
                </div>
                {rated ? (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 dark:bg-teal-950/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-xs font-semibold text-[#2C687B] dark:text-teal-300">Rated</span>
                  </div>
                ) : (
                  <svg className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="sticky-footer-bar fixed bottom-0 left-0 right-0 z-10 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || ratedItems.length === 0}
            className="min-h-12 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            style={{
              background: ratedItems.length === 0 ? undefined : '#DB1A1A',
              boxShadow: ratedItems.length > 0 ? '0 12px 32px -8px rgba(219,26,26,0.35)' : undefined,
            }}
          >
            {submitting ? 'Submitting...' : `Submit Feedback${ratedItems.length > 0 ? ` (${ratedItems.length} rated)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
