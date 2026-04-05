'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { TEACHER_FACTORS } from '@/lib/constants'

interface FactorRating {
  factor: string
  rating: number | null
  comment: string
}

function RatingSlider({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const getInfo = (v: number) => {
    if (v <= 2) return { label: 'Poor', color: '#ef4444' }
    if (v <= 4) return { label: 'Below Average', color: '#f97316' }
    if (v <= 6) return { label: 'Average', color: '#eab308' }
    if (v <= 8) return { label: 'Good', color: '#8CC7C4' }
    return { label: 'Excellent', color: '#2C687B' }
  }

  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => onChange(5)}
        className="min-h-12 w-full rounded-xl border-2 border-dashed border-slate-200 bg-transparent py-3.5 text-sm font-medium text-slate-400 transition-colors hover:border-[#8CC7C4] hover:text-[#2C687B] dark:border-slate-600 dark:text-slate-500 dark:hover:border-teal-600 dark:hover:text-teal-300"
      >
        + Click to rate this factor
      </button>
    )
  }

  const info = getInfo(value)
  const pct = ((value - 1) / 9) * 100

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-4xl font-bold tabular-nums" style={{ color: info.color }}>
            {value}
          </span>
          <span className="ml-1 text-lg text-slate-300 dark:text-slate-600">/10</span>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ color: info.color, backgroundColor: `${info.color}18` }}
        >
          {info.label}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--val': `${pct}%` } as React.CSSProperties}
        className="w-full"
      />
      <div className="mb-2 mt-2 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>1 — Poor</span>
        <span>10 — Excellent</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        className="min-h-10 p-0 text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      >
        Remove rating
      </button>
    </div>
  )
}

function RateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = decodeURIComponent(searchParams.get('name') || '')
  const isTimetable = name === 'Timetable Management'
  const factors = isTimetable ? ['Overall Rating'] : TEACHER_FACTORS

  const [ratings, setRatings] = useState<FactorRating[]>(factors.map((f) => ({ factor: f, rating: null, comment: '' })))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') {
      router.push('/')
      return
    }
    const stored = localStorage.getItem('academicRatings')
    if (stored) {
      const existing = JSON.parse(stored).find((r: { teacher_name: string }) => r.teacher_name === name)
      if (existing) {
        setRatings(
          factors.map(
            (f) => existing.factors.find((ef: FactorRating) => ef.factor === f) || { factor: f, rating: null, comment: '' },
          ),
        )
      }
    }
  }, [name, router])

  const updateRating = (i: number, rating: number | null) => setRatings((prev) => prev.map((r, idx) => (idx === i ? { ...r, rating } : r)))
  const updateComment = (i: number, comment: string) => setRatings((prev) => prev.map((r, idx) => (idx === i ? { ...r, comment } : r)))

  const handleSave = () => {
    const ratedFactors = ratings.filter((r) => r.rating !== null)
    if (ratedFactors.length === 0) {
      alert('Please give at least one rating before saving.')
      return
    }
    const stored = localStorage.getItem('academicRatings')
    let all = stored ? JSON.parse(stored) : []
    all = all.filter((r: { teacher_name: string }) => r.teacher_name !== name)
    all.push({ teacher_name: name, factors: ratedFactors })
    localStorage.setItem('academicRatings', JSON.stringify(all))
    setSaving(true)
    setTimeout(() => router.push('/feedback/academic'), 700)
  }

  const ratedCount = ratings.filter((r) => r.rating !== null).length
  const initials =
    name
      .split(' ')
      .filter((w) => /[A-Z]/.test(w))
      .map((w) => w[0])
      .join('')
      .slice(0, 2) || name.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen pb-32">
      <header className="glass-nav sticky top-0 z-10 px-4 sm:px-6">
        <div className="mx-auto flex min-h-12 max-w-xl items-center justify-between py-2">
          <button
            type="button"
            onClick={() => router.push('/feedback/academic')}
            className="flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
            {ratedCount}/{factors.length} rated
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2C687B] text-base font-bold text-white shadow-lg shadow-teal-900/25">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 sm:text-xl">{name}</h1>
            {!isTimetable ? (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Rate any or all of the {factors.length} factors below</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {ratings.map((item, index) => (
            <div
              key={item.factor}
              className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
                item.rating !== null
                  ? 'border-[#8CC7C4]/40 bg-white/95 dark:border-teal-800/50 dark:bg-slate-900/80'
                  : 'border-slate-200/80 bg-white/95 dark:border-slate-600/50 dark:bg-slate-900/70'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.factor}</span>
                {item.rating !== null ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : null}
              </div>
              <RatingSlider value={item.rating} onChange={(v) => updateRating(index, v)} />
              {item.rating !== null ? (
                <textarea
                  value={item.comment}
                  onChange={(e) => updateComment(index, e.target.value)}
                  placeholder="Any additional comments? (optional)"
                  rows={2}
                  className="input-field mt-4 resize-none bg-slate-50/80 dark:bg-slate-800/40"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky-footer-bar fixed bottom-0 left-0 right-0 z-10 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={handleSave}
            disabled={ratedCount === 0}
            className="min-h-12 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            style={{
              background: saving ? '#8CC7C4' : ratedCount === 0 ? undefined : '#DB1A1A',
              boxShadow: ratedCount > 0 && !saving ? '0 12px 32px -8px rgba(219,26,26,0.3)' : undefined,
            }}
          >
            {saving ? '✓ Saved!' : `Save Ratings (${ratedCount} rated)`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RateAcademicPage() {
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
