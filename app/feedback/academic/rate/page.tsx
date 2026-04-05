'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { TEACHER_FACTORS } from '@/lib/constants'

interface FactorRating { factor: string; rating: number | null; comment: string }

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
        style={{
          width: '100%', padding: '14px', borderRadius: '10px', border: '1.5px dashed #e0e0e0',
          background: 'transparent', color: '#bbb', fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#8CC7C4'; (e.currentTarget as HTMLButtonElement).style.color = '#8CC7C4' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e0e0'; (e.currentTarget as HTMLButtonElement).style.color = '#bbb' }}
      >
        + Click to rate this factor
      </button>
    )
  }

  const info = getInfo(value)
  const pct = ((value - 1) / 9) * 100

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '40px', fontWeight: 700, color: info.color, fontFamily: 'Inter, sans-serif' }}>{value}</span>
          <span style={{ fontSize: '18px', color: '#ccc', marginLeft: '4px' }}>/10</span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: info.color, background: `${info.color}15`, padding: '5px 12px', borderRadius: '100px' }}>
          {info.label}
        </span>
      </div>
      <input
        type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ '--val': `${pct}%` } as React.CSSProperties}
        className="w-full"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#ccc' }}>1 — Poor</span>
        <span style={{ fontSize: '11px', color: '#ccc' }}>10 — Excellent</span>
      </div>
      <button type="button" onClick={() => onChange(null)} style={{ fontSize: '12px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
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

  const [ratings, setRatings] = useState<FactorRating[]>(factors.map(f => ({ factor: f, rating: null, comment: '' })))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') { router.push('/'); return }
    const stored = localStorage.getItem('academicRatings')
    if (stored) {
      const existing = JSON.parse(stored).find((r: { teacher_name: string }) => r.teacher_name === name)
      if (existing) {
        setRatings(factors.map(f => existing.factors.find((ef: FactorRating) => ef.factor === f) || { factor: f, rating: null, comment: '' }))
      }
    }
  }, [name, router])

  const updateRating = (i: number, rating: number | null) => setRatings(prev => prev.map((r, idx) => idx === i ? { ...r, rating } : r))
  const updateComment = (i: number, comment: string) => setRatings(prev => prev.map((r, idx) => idx === i ? { ...r, comment } : r))

  const handleSave = () => {
    const ratedFactors = ratings.filter(r => r.rating !== null)
    if (ratedFactors.length === 0) { alert('Please give at least one rating before saving.'); return }
    const stored = localStorage.getItem('academicRatings')
    let all = stored ? JSON.parse(stored) : []
    all = all.filter((r: { teacher_name: string }) => r.teacher_name !== name)
    all.push({ teacher_name: name, factors: ratedFactors })
    localStorage.setItem('academicRatings', JSON.stringify(all))
    setSaving(true)
    setTimeout(() => router.push('/feedback/academic'), 700)
  }

  const ratedCount = ratings.filter(r => r.rating !== null).length
  const initials = name.split(' ').filter(w => /[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2) || name.slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '100px' }}>

      {/* Nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #eaeaea', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/feedback/academic')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <span style={{ fontSize: '13px', color: '#aaa' }}>{ratedCount}/{factors.length} rated</span>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Teacher header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: '#2C687B', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '16px', fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{name}</div>
            {!isTimetable && <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Rate any or all of the {factors.length} factors below</div>}
          </div>
        </div>

        {/* Factor cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ratings.map((item, index) => (
            <div key={item.factor} style={{ background: 'white', border: `1px solid ${item.rating !== null ? '#e0f0f2' : '#eaeaea'}`, borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{item.factor}</span>
                {item.rating !== null && (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f0f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
                  style={{
                    width: '100%', marginTop: '14px', borderRadius: '10px',
                    border: '1.5px solid #eee', padding: '10px 14px',
                    fontSize: '13px', color: '#1a1a2e', fontFamily: 'Inter, sans-serif',
                    resize: 'none', outline: 'none', background: '#fafafa',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#8CC7C4'}
                  onBlur={e => e.target.style.borderColor = '#eee'}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky save */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,250,250,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #eaeaea', padding: '16px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={handleSave}
            disabled={ratedCount === 0}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
              background: saving ? '#8CC7C4' : ratedCount === 0 ? '#f0f0f0' : '#DB1A1A',
              color: ratedCount === 0 ? '#bbb' : 'white',
              fontWeight: 700, fontSize: '15px',
              cursor: ratedCount === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: ratedCount > 0 && !saving ? '0 4px 20px rgba(219,26,26,0.2)' : 'none',
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#888' }}>Loading...</p></div>}>
      <RateForm />
    </Suspense>
  )
}