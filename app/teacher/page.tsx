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
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: '14px' }}>Loading your feedback...</p>
      </div>
    )
  }

  const avg = overallAvg()
  const avgNum = avg ? parseFloat(avg) : 0
  const scoreColor = avgNum >= 8 ? '#2C687B' : avgNum >= 5 ? '#f97316' : '#DB1A1A'

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* Nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #eaeaea', padding: '0 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2C687B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{teacherName}</div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>Teacher Dashboard</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/change-password" style={{ fontSize: '12px', color: '#2C687B', textDecoration: 'none', fontWeight: 500, padding: '6px 12px', borderRadius: '8px', border: '1px solid #e0f0f2', background: '#f0f9fa' }}>
              Password
            </Link>
            <button onClick={() => { clearUser(); router.push('/') }} style={{ fontSize: '12px', color: '#888', background: 'none', border: '1px solid #eee', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Overall score */}
        {avg && (
          <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '16px', padding: '28px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '56px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{avg}</div>
              <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>/ 10 overall</div>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid #f0f0f0', paddingLeft: '28px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Your Average Rating</div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                Based on {feedback.length} response{feedback.length !== 1 ? 's' : ''} from students
              </div>
              <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: scoreColor, borderRadius: '4px', width: `${(avgNum / 10) * 100}%`, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>
        )}

        {/* No feedback */}
        {feedback.length === 0 && (
          <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>No feedback yet</div>
            <div style={{ fontSize: '13px', color: '#aaa' }}>Check back after students submit their ratings.</div>
          </div>
        )}

        {/* Factor cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ALL_FACTORS.map(factor => {
            const factorAvg = getAvg(factor)
            const comments = getComments(factor)
            if (!factorAvg && !comments.length) return null
            const factorAvgNum = factorAvg ? parseFloat(factorAvg) : 0
            const barColor = factorAvgNum >= 8 ? '#2C687B' : factorAvgNum >= 5 ? '#8CC7C4' : '#DB1A1A'
            const totalVotes = feedback.filter(f => f.factor === factor).length

            return (
              <div key={factor} style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{factor}</span>
                  {factorAvg && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 700, color: barColor }}>{factorAvg}</span>
                      <span style={{ fontSize: '13px', color: '#ccc' }}>/10</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
                  {totalVotes} response{totalVotes !== 1 ? 's' : ''}
                </div>
                {factorAvg && (
                  <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', marginBottom: '16px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: barColor, borderRadius: '3px', width: `${(factorAvgNum / 10) * 100}%` }} />
                  </div>
                )}
                {comments.length > 0 && (
                  <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                      Anonymous Comments
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {comments.map((c, i) => (
                        <div key={i} style={{ background: '#f8f8f8', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#555', borderLeft: '3px solid #8CC7C4' }}>
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