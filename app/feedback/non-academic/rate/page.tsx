// ================================================================
// FILE: app/feedback/non-academic/rate/page.tsx
// ================================================================

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

  const getRatingInfo = (v: number) => {
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

  const info = rating ? getRatingInfo(rating) : null
  const pct = rating ? ((rating - 1) / 9) * 100 : 0

  return (
    <div className="min-h-screen pb-32" style={{ background: '#FFF6F6' }}>
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

      <div className="px-6 -mt-6">
        <div className="max-w-md mx-auto">
          <div className="card p-6">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#2C687B' }}>{category}</h3>

            {rating === null ? (
              <button type="button" onClick={() => setRating(5)} className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-80" style={{ border: '2px dashed #8CC7C4', color: '#8CC7C4' }}>
                + Tap to rate
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-display text-4xl font-bold" style={{ color: info!.color }}>{rating}</span>
                    <span className="text-lg ml-1" style={{ color: '#8CC7C4' }}>/10</span>
                  </div>
                  <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: `${info!.color}15`, color: info!.color }}>{info!.label}</span>
                </div>
                <input
                  type="range" min={1} max={10} step={1} value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  style={{ '--val': `${pct}%` } as React.CSSProperties}
                  className="w-full mb-2"
                />
                <div className="flex justify-between mb-3">
                  <span className="text-xs" style={{ color: '#8CC7C4' }}>1 — Poor</span>
                  <span className="text-xs" style={{ color: '#8CC7C4' }}>10 — Excellent</span>
                </div>
                <button type="button" onClick={() => setRating(null)} className="text-xs" style={{ color: '#8CC7C4' }}>Remove rating</button>
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

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'rgba(255,246,246,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #f0f0f0' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={rating === null}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40"
            style={{ background: saving ? '#8CC7C4' : '#2C687B', boxShadow: rating !== null ? '0 8px 24px rgba(44,104,123,0.25)' : 'none' }}
          >
            {saving
              ? <span className="flex items-center justify-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!</span>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6F6' }}><div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: '#2C687B', borderTopColor: 'transparent' }} /></div>}>
      <RateForm />
    </Suspense>
  )
}


// ================================================================
// FILE: app/teacher/page.tsx
// ================================================================

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TEACHER_FACTORS } from '@/lib/constants'
import Link from 'next/link'

interface FeedbackRow { factor: string; rating: number; comment: string }
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
    if (!user || user.role !== 'teacher') { router.push('/'); return }
    setTeacherName(user.name)
    fetchFeedback(user.name)
  }, [router])

  const fetchFeedback = async (name: string) => {
    const { data } = await supabase.from('academic_feedback').select('factor, rating, comment').eq('teacher_name', name)
    if (data) setFeedback(data)
    setLoading(false)
  }

  const getAvg = (factor: string) => {
    const rows = feedback.filter(f => f.factor === factor)
    if (!rows.length) return null
    return (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1)
  }

  const getComments = (factor: string) => feedback.filter(f => f.factor === factor && f.comment?.trim())

  const overallAvg = () => {
    if (!feedback.length) return null
    return (feedback.reduce((s, r) => s + r.rating, 0) / feedback.length).toFixed(1)
  }

  const initials = teacherName.split(' ').filter(w => w.match(/[A-Z]/)).map(w => w[0]).join('').slice(0, 2) || 'T'

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6F6' }}>
        <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: '#2C687B', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF6F6' }}>
      {/* Header */}
      <div style={{ background: '#2C687B' }} className="px-6 pt-10 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#8CC7C4' }}>Teacher Dashboard</p>
                <h2 className="font-display text-xl font-bold text-white">{teacherName}</h2>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Link href="/change-password" className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: '#8CC7C4', border: '1.5px solid rgba(140,199,196,0.4)' }}>Password</Link>
              <button onClick={() => { clearUser(); router.push('/') }} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.2)' }}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 pb-10">
        <div className="max-w-2xl mx-auto">
          {/* Overall score card */}
          {overallAvg() && (
            <div className="card p-6 mb-5 flex items-center gap-6">
              <div className="text-center">
                <div className="font-display text-5xl font-bold" style={{ color: '#DB1A1A' }}>{overallAvg()}</div>
                <div className="text-xs font-semibold mt-1" style={{ color: '#8CC7C4' }}>/ 10 Overall</div>
              </div>
              <div className="flex-1 border-l pl-6" style={{ borderColor: '#f0f0f0' }}>
                <p className="font-display font-bold text-lg mb-1" style={{ color: '#2C687B' }}>Your Average Rating</p>
                <p className="text-sm" style={{ color: '#8CC7C4' }}>Based on {feedback.length} response{feedback.length !== 1 ? 's' : ''} from students</p>
                <div className="h-2 rounded-full mt-3" style={{ background: '#f0f0f0' }}>
                  <div className="h-full rounded-full" style={{ width: `${(parseFloat(overallAvg()!) / 10) * 100}%`, background: '#DB1A1A' }} />
                </div>
              </div>
            </div>
          )}

          {feedback.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#edf7f7' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8CC7C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <p className="font-display font-bold text-lg mb-1" style={{ color: '#2C687B' }}>No feedback yet</p>
              <p className="text-sm" style={{ color: '#8CC7C4' }}>Check back after students submit their ratings.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {ALL_FACTORS.map(factor => {
                const avg = getAvg(factor)
                const comments = getComments(factor)
                if (!avg && !comments.length) return null
                const totalVotes = feedback.filter(f => f.factor === factor).length
                const avgNum = avg ? parseFloat(avg) : 0
                const barColor = avgNum >= 8 ? '#2C687B' : avgNum >= 5 ? '#8CC7C4' : '#DB1A1A'

                return (
                  <div key={factor} className="card p-5">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-sm" style={{ color: '#2C687B' }}>{factor}</h3>
                      {avg && (
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-display font-bold text-2xl" style={{ color: barColor }}>{avg}</span>
                          <span className="text-sm" style={{ color: '#8CC7C4' }}>/10</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#8CC7C4' }}>{totalVotes} response{totalVotes !== 1 ? 's' : ''}</p>
                    {avg && (
                      <div className="h-2 rounded-full mb-4" style={{ background: '#f0f0f0' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(avgNum / 10) * 100}%`, background: barColor }} />
                      </div>
                    )}
                    {comments.length > 0 && (
                      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8CC7C4' }}>Anonymous Comments</p>
                        <div className="flex flex-col gap-2">
                          {comments.map((c, i) => (
                            <div key={i} className="rounded-xl px-4 py-3 text-sm" style={{ background: '#fafafa', borderLeft: '3px solid #8CC7C4', color: '#2C687B' }}>
                              {c.comment}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}