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

  const getAvg      = (factor: string) => { const rows = feedback.filter(f => f.factor === factor); if (!rows.length) return null; return (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) }
  const getComments = (factor: string) => feedback.filter(f => f.factor === factor && f.comment?.trim())
  const overallAvg  = () => { if (!feedback.length) return null; return (feedback.reduce((s, r) => s + r.rating, 0) / feedback.length).toFixed(1) }

  const initials = teacherName.split(' ').filter(w => /[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2) || 'T'

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Loading your feedback...</p>
      </div>
    )
  }

  const avg    = overallAvg()
  const avgNum = avg ? parseFloat(avg) : 0
  const scoreColor = avgNum >= 8 ? 'var(--teal)' : avgNum >= 5 ? '#f97316' : '#DB1A1A'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <div className="top-nav">
        <div className="top-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacherName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Teacher Dashboard</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <Link href="/change-password" className="btn-ghost" style={{ color: 'var(--teal)', borderColor: 'var(--teal-border)', background: 'var(--teal-bg)' }}>Pass</Link>
            <button onClick={() => { clearUser(); router.push('/') }} className="btn-ghost">Out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Overall score */}
        {avg && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{avg}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>/ 10</div>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '20px', minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Overall Average</div>
              <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '12px' }}>
                {feedback.length} response{feedback.length !== 1 ? 's' : ''} from students
              </div>
              <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: scoreColor, borderRadius: '3px', width: `${(avgNum / 10) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {feedback.length === 0 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>No feedback yet</div>
            <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Check back after students submit their ratings.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ALL_FACTORS.map(factor => {
            const factorAvg  = getAvg(factor)
            const comments   = getComments(factor)
            if (!factorAvg && !comments.length) return null
            const factorNum  = factorAvg ? parseFloat(factorAvg) : 0
            const barColor   = factorNum >= 8 ? 'var(--teal)' : factorNum >= 5 ? 'var(--teal-light)' : '#DB1A1A'
            const totalVotes = feedback.filter(f => f.factor === factor).length

            return (
              <div key={factor} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{factor}</span>
                  {factorAvg && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: barColor }}>{factorAvg}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text3)' }}>/10</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px' }}>
                  {totalVotes} response{totalVotes !== 1 ? 's' : ''}
                </div>
                {factorAvg && (
                  <div style={{ height: '5px', background: 'var(--bg3)', borderRadius: '3px', marginBottom: '14px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: barColor, borderRadius: '3px', width: `${(factorNum / 10) * 100}%` }} />
                  </div>
                )}
                {comments.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Anonymous Comments</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {comments.map((c, i) => (
                        <div key={i} style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: 'var(--text2)', borderLeft: '3px solid var(--teal-light)' }}>
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
  )
}