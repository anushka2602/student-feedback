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
    if (!user || user.role !== 'student') { router.push('/'); return }
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
    if (allRatings.length === 0) { alert('Please rate at least one item before submitting.'); return }
    if (!confirm('Submit all your ratings? You cannot change them after submitting.')) return
    setSubmitting(true)
    const rows: { student_id: string; student_name: string; teacher_name: string; factor: string; rating: number; comment: string }[] = []
    for (const item of allRatings) {
      for (const f of item.factors) {
        rows.push({ student_id: user.id, student_name: user.name, teacher_name: item.teacher_name, factor: f.factor, rating: f.rating, comment: f.comment || '' })
      }
    }
    const { error } = await supabase.from('academic_feedback').insert(rows)
    if (error) { alert('Error submitting. Please try again.'); setSubmitting(false); return }
    localStorage.removeItem('academicRatings')
    setSubmitted(true)
    setSubmitting(false)
  }

  if (!mounted) return null

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #eaeaea', padding: '48px', textAlign: 'center', maxWidth: '360px', width: '100%' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Submitted!</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Thank you for your valuable feedback.</p>
          <button onClick={() => router.push('/feedback')} style={{ background: '#2C687B', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const progress = Math.round((ratedItems.length / ALL_ITEMS.length) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* Nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #eaeaea', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/feedback')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Academic Feedback</span>
          <span style={{ fontSize: '13px', color: '#888' }}>{ratedItems.length}/{ALL_ITEMS.length} rated</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: '3px', background: '#f0f0f0' }}>
          <div style={{ height: '100%', background: '#DB1A1A', width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 120px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Rate Teachers</h1>
          <p style={{ color: '#888', fontSize: '13px' }}>Tap any name to rate. All factors are optional.</p>
        </div>

        {/* Teacher list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ALL_ITEMS.map((item, i) => {
            const rated = ratedItems.includes(item)
            const isTimetable = item === 'Timetable Management'
            return (
              <button
                key={item}
                onClick={() => router.push(`/feedback/academic/rate?name=${encodeURIComponent(item)}`)}
                style={{
                  background: 'white', border: `1px solid ${rated ? '#8CC7C4' : '#eaeaea'}`,
                  borderRadius: '12px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: rated ? '#f0f9fa' : '#f8f8f8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isTimetable ? '18px' : '14px', fontWeight: 700,
                  color: rated ? '#2C687B' : '#bbb',
                }}>
                  {isTimetable ? '📅' : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</div>
                  {!isTimetable && <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>8 rating factors</div>}
                </div>
                {rated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0f9fa', padding: '5px 12px', borderRadius: '100px', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2C687B' }}>Rated</span>
                  </div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,250,250,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #eaeaea', padding: '16px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || ratedItems.length === 0}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
              background: ratedItems.length === 0 ? '#f0f0f0' : '#DB1A1A',
              color: ratedItems.length === 0 ? '#bbb' : 'white',
              fontWeight: 700, fontSize: '15px', cursor: ratedItems.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              boxShadow: ratedItems.length > 0 ? '0 4px 20px rgba(219,26,26,0.25)' : 'none',
            }}
          >
            {submitting ? 'Submitting...' : `Submit Feedback${ratedItems.length > 0 ? ` (${ratedItems.length} rated)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}