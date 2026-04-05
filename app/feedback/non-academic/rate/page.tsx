'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser } from '@/lib/auth'

function RateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = decodeURIComponent(searchParams.get('category') || '')
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') {
      router.push('/')
      return
    }
    const stored = localStorage.getItem('nonAcademicRatings')
    if (stored) {
      const existing = JSON.parse(stored).find((r: { category: string }) => r.category === category)
      if (existing) {
        setRating(existing.rating)
        setComment(existing.comment || '')
      }
    }
  }, [category, router])

  const getInfo = (v: number) => {
    if (v <= 2) return { label: 'Poor', color: '#ef4444' }
    if (v <= 4) return { label: 'Below Average', color: '#f97316' }
    if (v <= 6) return { label: 'Average', color: '#eab308' }
    if (v <= 8) return { label: 'Good', color: '#8CC7C4' }
    return { label: 'Excellent', color: '#2C687B' }
  }

  const handleSave = () => {
    if (rating === null) {
      alert('Please give a rating before saving.')
      return
    }
    const stored = localStorage.getItem('nonAcademicRatings')
    let all = stored ? JSON.parse(stored) : []
    all = all.filter((r: { category: string }) => r.category !== category)
    all.push({ category, rating, comment })
    localStorage.setItem('nonAcademicRatings', JSON.stringify(all))
    setSaving(true)
    setTimeout(() => router.push('/feedback/non-academic'), 700)
  }

  const info = rating ? getInfo(rating) : null
  const pct = rating ? ((rating - 1) / 9) * 100 : 0

  return (
    <div className="min-h-screen pb-32">
      <header className="glass-nav sticky top-0 z-10 px-4 sm:px-6">
        <div className="mx-auto flex min-h-12 max-w-xl items-center py-2">
          <button
            type="button"
            onClick={() => router.push('/feedback/non-academic')}
            className="flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rating</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">{category}</h1>
        </div>

        <div className="surface rounded-2xl p-5 sm:p-6">
          {rating === null ? (
            <button
              type="button"
              onClick={() => setRating(5)}
              className="min-h-12 w-full rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-400 transition-colors hover:border-[#8CC7C4] hover:text-[#2C687B] dark:border-slate-600 dark:text-slate-500 dark:hover:border-teal-600 dark:hover:text-teal-300"
            >
              + Click to rate
            </button>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-4xl font-bold tabular-nums" style={{ color: info!.color }}>
                    {rating}
                  </span>
                  <span className="ml-1 text-lg text-slate-300 dark:text-slate-600">/10</span>
                </div>
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ color: info!.color, backgroundColor: `${info!.color}18` }}
                >
                  {info!.label}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ '--val': `${pct}%` } as React.CSSProperties}
                className="w-full"
              />
              <div className="mb-2 mt-2 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>1 — Poor</span>
                <span>10 — Excellent</span>
              </div>
              <button
                type="button"
                onClick={() => setRating(null)}
                className="min-h-10 p-0 text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                Remove rating
              </button>
            </div>
          )}

          {rating !== null ? (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional comments? (optional)"
              rows={3}
              className="input-field mt-5 resize-none bg-slate-50/80 dark:bg-slate-800/40"
            />
          ) : null}
        </div>
      </div>

      <div className="sticky-footer-bar fixed bottom-0 left-0 right-0 z-10 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={handleSave}
            disabled={rating === null}
            className="min-h-12 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            style={{
              background: saving ? '#8CC7C4' : rating === null ? undefined : '#2C687B',
              boxShadow: rating !== null && !saving ? '0 12px 32px -8px rgba(44,104,123,0.3)' : undefined,
            }}
          >
            {saving ? '✓ Saved!' : 'Save Rating'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RateNonAcademicPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="animate-pulse-soft text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      }
    >
      <RateForm />
    </Suspense>
  )
}
