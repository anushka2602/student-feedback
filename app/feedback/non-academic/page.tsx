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
    if (!user || user.role !== 'student') { router.push('/'); return }
    const stored = localStorage.getItem('nonAcademicRatings')
    if (stored) {
      const existing = JSON.parse(stored).find((r: { category: string }) => r.category === category)
      if (existing) { setRating(existing.rating); setComment(existing.comment || '') }
    }
  }, [category, router])

  const getInfo = (v: number) => {
    if (v <= 2) return { label: 'Poor', color: '#DB1A1A' }
    if (v <= 4) return { label: 'Below Average', color: '#e85d04' }
    if (v <= 6) return { label: 'Average', color: '#f4a261' }
    if (v <= 8) return { label: 'Good', color: '#8CC7C4' }
    return { label: 'Excellent', color: '#2C687B' }
  }

  const handleSave = () => {
    if (rating === null) { alert('Please give a rating before saving.'); return }
    const stored = localStorage.getItem('nonAcademicRatings')
    let all = stored ? JSON.parse(stored) : []
    all = all.filter((r: { category: string }) => r.category !== category)
    all.push({ category, rating, comment })
    localStorage.setItem('nonAcademicRatings', JSON.stringify(all))
    setSaving(true)
    setTimeout(() => router.push('/feedback/non-academic'), 800)
  }

  const info = rating ? getInfo(rating) : null
  const pct = rating ? ((rating - 1) / 9) * 100 : 0

  return (
    <div className="min-h-screen pb-32" style={{ background: '#FFF6F6' }}>

      {/* Header */}
      <div style={{ background: '#2C687B' }} className="px-6 pt-10 pb-14">
        <div className="max-w-md mx-auto">
          <button onClick={() => router.push('/feedback/non-academic')} className="flex items-center gap-2 text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to list
          </button>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Rating</p>
          <h2 className="font-display text-xl font-bold text-white">{category}</h2>
        </div>
      </div>

      {/* Rating card */}
      <div className="px-6 -mt-6">
        <div className="max-w-md mx-auto">
          <div className="card p-6">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#2C687B' }}>{category}</h3>

            {rating === null ? (
              <button
                type="button"
                onClick={() => setRating(5)}
                className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ border: '2px dashed #8CC7C4', color: '#8CC7C4' }}
              >
                + Tap to rate
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-display font-bold" style={{ fontSize: '2.5rem', color: info!.color }}>{rating}</span>
                    <span className="text-lg ml-1" style={{ color: '#8CC7C4' }}>/10</span>
                  </div>
                  <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: `${info!.color}18`, color: info!.color }}>
                    {info!.label}
                  </span>
                </div>
                <input
                  type="range" min={1} max={10} step={1}
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  style={{ '--val': `${pct}%` } as React.CSSProperties}
                  className="w-full mb-2"
                />
                <div className="flex justify-between mb-3">
                  <span className="text-xs" style={{ color: '#8CC7C4' }}>1 — Poor</span>
                  <span className="text-xs" style={{ color: '#8CC7C4' }}>10 — Excellent</span>
                </div>
                <button type="button" onClick={() => setRating(null)} className="text-xs" style={{ color: '#8CC7C4' }}>
                  Remove rating
                </button>
              </div>
            )}

            {rating !== null && (
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Any additional comments? (optional)"
                rows={3}
                className="w-full mt-4 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                style={{ border: '2px solid #f0f0f0', color: '#2C687B', fontFamily: 'DM Sans, sans-serif', background: '#fafafa' }}
                onFocus={e => e.target.style.borderColor = '#8CC7C4'}
                onBlur={e => e.target.style.borderColor = '#f0f0f0'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'rgba(255,246,246,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #f0f0f0' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={rating === null}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40"
            style={{
              background: saving ? '#8CC7C4' : '#2C687B',
              boxShadow: rating !== null ? '0 8px 24px rgba(44,104,123,0.25)' : 'none',
            }}
          >
            {saving
              ? <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Saved!
                </span>
              : 'Save Rating'
            }
          </button>
        </div>
      </div>

    </div>
  )
}

export default function RateNonAcademicPage() {
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