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
    if (v <= 2) return { label: 'Poor', color: '#DB1A1A' }
    if (v <= 4) return { label: 'Below Average', color: '#e85d04' }
    if (v <= 6) return { label: 'Average', color: '#f4a261' }
    if (v <= 8) return { label: 'Good', color: '#8CC7C4' }
    return { label: 'Excellent', color: '#2C687B' }
  }

  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => onChange(5)}
        className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
        style={{ border: '2px dashed #8CC7C4', color: '#8CC7C4', background: 'transparent' }}
      >
        + Tap to rate this factor
      </button>
    )
  }

  const info = getInfo(value)
  const pct = ((value - 1) / 9) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-display font-bold" style={{ fontSize: '2.5rem', color: info.color }}>{value}</span>
          <span className="text-lg ml-1" style={{ color: '#8CC7C4' }}>/10</span>
        </div>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: `${info.color}18`, color: info.color }}>
          {info.label}
        </span>
      </div>
      <input
        type="range"
        min={1} max={10} step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ '--val': `${pct}%` } as React.CSSProperties}
        className="w-full mb-2"
      />
      <div className="flex justify-between mb-3">
        <span className="text-xs" style={{ color: '#8CC7C4' }}>1 — Poor</span>
        <span className="text-xs" style={{ color: '#8CC7C4' }}>10 — Excellent</span>
      </div>
      <button type="button" onClick={() => onChange(null)} className="text-xs" style={{ color: '#8CC7C4' }}>
        Remove this rating
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

  const [ratings, setRatings] = useState<FactorRating[]>(
    factors.map(f => ({ factor: f, rating: null, comment: '' }))
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') { router.push('/'); return }
    const stored = localStorage.getItem('academicRatings')
    if (stored) {
      const all = JSON.parse(stored)
      const existing = all.find((r: { teacher_name: string }) => r.teacher_name === name)
      if (existing) {
        setRatings(factors.map(f => {
          const found = existing.factors.find((ef: FactorRating) => ef.factor === f)
          return found || { factor: f, rating: null, comment: '' }
        }))
      }
    }
  }, [name, router])

  const updateRating = (i: number, rating: number | null) =>
    setRatings(prev => prev.map((r, idx) => idx === i ? { ...r, rating } : r))

  const updateComment = (i: number, comment: string) =>
    setRatings(prev => prev.map((r, idx) => idx === i ? { ...r, comment } : r))

  const handleSave = () => {
    const ratedFactors = ratings.filter(r => r.rating !== null)
    if (ratedFactors.length === 0) { alert('Please give at least one rating before saving.'); return }
    const stored = localStorage.getItem('academicRatings')
    let all = stored ? JSON.parse(stored) : []
    all = all.filter((r: { teacher_name: string }) => r.teacher_name !== name)
    all.push({ teacher_name: name, factors: ratedFactors })
    localStorage.setItem('academicRatings', JSON.stringify(all))
    setSaving(true)
    setTimeout(() => router.push('/feedback/academic'), 800)
  }

  const ratedCount = ratings.filter(r => r.rating !== null).length
  const initials = name.split(' ').filter(w => /[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2) || name.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen pb-32" style={{ background: '#FFF6F6' }}>

      {/* Header */}
      <div style={{ background: '#2C687B' }} className="px-6 pt-10 pb-14">
        <div className="max-w-md mx-auto">
          <button onClick={() => router.push('/feedback/academic')} className="flex items-center gap-2 text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to list
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Rating</p>
              <h2 className="font-display text-xl font-bold text-white leading-tight">{name}</h2>
              {!isTimetable && (
                <p className="text-xs mt-1" style={{ color: '#8CC7C4' }}>{ratedCount} of {factors.length} factors rated</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Factor cards */}
      <div className="px-6 -mt-6">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          {ratings.map((item, index) => (
            <div key={item.factor} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: '#2C687B' }}>{item.factor}</h3>
                {item.rating !== null && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#edf7f7' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>
              <RatingSlider value={item.rating} onChange={v => updateRating(index, v)} />
              {item.rating !== null && (
                <textarea
                  value={item.comment}
                  onChange={e => updateComment(index, e.target.value)}
                  placeholder="Any additional comments? (optional)"
                  rows={2}
                  className="w-full mt-4 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                  style={{ border: '2px solid #f0f0f0', color: '#2C687B', fontFamily: 'DM Sans, sans-serif', background: '#fafafa' }}
                  onFocus={e => e.target.style.borderColor = '#8CC7C4'}
                  onBlur={e => e.target.style.borderColor = '#f0f0f0'}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'rgba(255,246,246,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #f0f0f0' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={ratedCount === 0}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40"
            style={{
              background: saving ? '#8CC7C4' : '#DB1A1A',
              boxShadow: ratedCount > 0 ? '0 8px 24px rgba(219,26,26,0.25)' : 'none',
            }}
          >
            {saving
              ? <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Saved!
                </span>
              : `Save (${ratedCount} rated)`
            }
          </button>
          <p className="text-center text-xs mt-2" style={{ color: '#8CC7C4' }}>Only factors you rated will be saved</p>
        </div>
      </div>

    </div>
  )
}

export default function RateAcademicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6F6' }}>
        <p style={{ color: '#2C687B' }}>Loading...</p>
      </div>
    }>
      <RateForm />
    </Suspense>
  )
}