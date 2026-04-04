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
    if (v <= 2) return { label: 'Poor', color: '#ef4444' }
    if (v <= 4) return { label: 'Below Average', color: '#f97316' }
    if (v <= 6) return { label: 'Average', color: '#eab308' }
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
    setTimeout(() => router.push('/feedback/non-academic'), 700)
  }

  const info = rating ? getInfo(rating) : null
  const pct = rating ? ((rating - 1) / 9) * 100 : 0

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '100px' }}>

      {/* Nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #eaeaea', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => router.push('/feedback/non-academic')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', color: '#aaa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Rating</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e' }}>{category}</h1>
        </div>

        <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '20px' }}>{category}</div>

          {rating === null ? (
            <button
              type="button"
              onClick={() => setRating(5)}
              style={{
                width: '100%', padding: '16px', borderRadius: '10px', border: '1.5px dashed #e0e0e0',
                background: 'transparent', color: '#bbb', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              + Click to rate
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '40px', fontWeight: 700, color: info!.color }}>{rating}</span>
                  <span style={{ fontSize: '18px', color: '#ccc', marginLeft: '4px' }}>/10</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: info!.color, background: `${info!.color}15`, padding: '5px 12px', borderRadius: '100px' }}>
                  {info!.label}
                </span>
              </div>
              <input
                type="range" min={1} max={10} step={1} value={rating}
                onChange={e => setRating(Number(e.target.value))}
                style={{ '--val': `${pct}%` } as React.CSSProperties}
                className="w-full"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#ccc' }}>1 — Poor</span>
                <span style={{ fontSize: '11px', color: '#ccc' }}>10 — Excellent</span>
              </div>
              <button type="button" onClick={() => setRating(null)} style={{ fontSize: '12px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
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
              style={{
                width: '100%', marginTop: '16px', borderRadius: '10px',
                border: '1.5px solid #eee', padding: '12px 14px',
                fontSize: '13px', color: '#1a1a2e', fontFamily: 'Inter, sans-serif',
                resize: 'none', outline: 'none', background: '#fafafa',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#8CC7C4'}
              onBlur={e => e.target.style.borderColor = '#eee'}
            />
          )}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,250,250,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #eaeaea', padding: '16px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={handleSave}
            disabled={rating === null}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
              background: saving ? '#8CC7C4' : rating === null ? '#f0f0f0' : '#2C687B',
              color: rating === null ? '#bbb' : 'white',
              fontWeight: 700, fontSize: '15px',
              cursor: rating === null ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: rating !== null && !saving ? '0 4px 20px rgba(44,104,123,0.2)' : 'none',
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#888' }}>Loading...</p></div>}>
      <RateForm />
    </Suspense>
  )
}