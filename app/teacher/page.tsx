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

  const initials = teacherName.split(' ').filter(w => /[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2) || 'T'

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6F6' }}>
        <p style={{ color: '#2C687B' }}>Loading your feedback...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF6F6' }}>

      {/* Teal header */}
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
              <Link href="/change-password" className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: '#8CC7C4', border: '1.5px solid rgba(140,199,196,0.4)' }}>
                Password
              </Link>
              <button onClick={() => { clearUser(); router.push('/') }} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 pb-10">
        <div className="max-w-2xl mx-auto">

          {/* Overall score */}
          {overallAvg() && (
            <div className="card p-6 mb-5 flex items-center gap-6">
              <div className="text-center">
                <div className="font-display font-bold" style={{ fontSize: '3rem', color: '#DB1A1A' }}>{overallAvg()}</div>
                <div className="text-xs font-semibold mt-1" style={{ color: '#8CC7C4' }}>/ 10 Overall</div>
              </div>
              <div className="flex-1 pl-6" style={{ borderLeft: '1px solid #f0f0f0' }}>
                <p className="font-display font-bold text-lg mb-1" style={{ color: '#2C687B' }}>Your Average Rating</p>
                <p className="text-sm mb-3" style={{ color: '#8CC7C4' }}>Based on {feedback.length} response{feedback.length !== 1 ? 's' : ''} from students</p>
                <div className="h-2 rounded-full" style={{ background: '#f0f0f0' }}>
                  <div className="h-full rounded-full" style={{ width: `${(parseFloat(overallAvg()!) / 10) * 100}%`, background: '#DB1A1A' }} />
                </div>
              </div>
            </div>
          )}

          {/* No feedback state */}
          {feedback.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#edf7f7' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8CC7C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <p className="font-display font-bold text-lg mb-1" style={{ color: '#2C687B' }}>No feedback yet</p>
              <p className="text-sm" style={{ color: '#8CC7C4' }}>Check back after students submit their ratings.</p>
            </div>
          )}

          {/* Factor cards */}
          <div className="flex flex-col gap-4">
            {ALL_FACTORS.map(factor => {
              const avg = getAvg(factor)
              const comments = getComments(factor)
              if (!avg && !comments.length) return null
              const avgNum = avg ? parseFloat(avg) : 0
              const barColor = avgNum >= 8 ? '#2C687B' : avgNum >= 5 ? '#8CC7C4' : '#DB1A1A'
              const totalVotes = feedback.filter(f => f.factor === factor).length

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
                      <div className="h-full rounded-full" style={{ width: `${(avgNum / 10) * 100}%`, background: barColor }} />
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

        </div>
      </div>
    </div>
  )
}