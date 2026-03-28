'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TEACHER_FACTORS } from '@/lib/constants'
import Link from 'next/link'

interface FeedbackRow {
  factor: string
  rating: number
  comment: string
}

const ALL_FACTORS = [...TEACHER_FACTORS, 'Timetable Management']

export default function TeacherDashboard() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherName, setTeacherName] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'teacher') { router.push('/'); return }
    setTeacherName(user.name)
    fetchFeedback(user.name)
  }, [router])

  const fetchFeedback = async (name: string) => {
    const { data } = await supabase
      .from('academic_feedback')
      .select('factor, rating, comment')
      .eq('teacher_name', name)
    if (data) setFeedback(data)
    setLoading(false)
  }

  const getAvg = (factor: string) => {
    const rows = feedback.filter(f => f.factor === factor)
    if (!rows.length) return null
    return (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1)
  }

  const getComments = (factor: string) =>
    feedback.filter(f => f.factor === factor && f.comment?.trim())

  const overallAvg = () => {
    if (!feedback.length) return null
    return (feedback.reduce((s, r) => s + r.rating, 0) / feedback.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6F6] flex items-center justify-center">
        <p className="text-[#2C687B] font-semibold">Loading your feedback...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF6F6] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[#8CC7C4] text-xs uppercase tracking-widest font-semibold">Teacher Dashboard</p>
            <h2 className="text-2xl font-extrabold text-[#2C687B] mt-1">{teacherName}</h2>
            {overallAvg() && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[#8CC7C4] text-sm">Overall Average:</span>
                <span className="text-[#DB1A1A] font-extrabold text-xl">{overallAvg()}</span>
                <span className="text-[#8CC7C4] text-sm">/10</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Link href="/change-password"
              className="text-xs text-[#2C687B] border-2 border-[#2C687B] px-3 py-2 rounded-xl font-semibold hover:bg-[#2C687B] hover:text-white transition-colors">
              Change Password
            </Link>
            <button
              onClick={() => { clearUser(); router.push('/') }}
              className="text-xs text-[#DB1A1A] border-2 border-[#DB1A1A] px-3 py-2 rounded-xl font-semibold hover:bg-[#DB1A1A] hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Ratings */}
        {feedback.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-[#8CC7C4] font-semibold">No feedback received yet.</p>
            <p className="text-[#8CC7C4] text-sm mt-1">Check back after students submit ratings.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ALL_FACTORS.map(factor => {
              const avg = getAvg(factor)
              const comments = getComments(factor)
              if (!avg && !comments.length) return null
              const totalVotes = feedback.filter(f => f.factor === factor).length

              return (
                <div key={factor} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[#2C687B] font-bold">{factor}</h3>
                    {avg && (
                      <div className="flex items-baseline gap-0.5 bg-[#FFF6F6] px-3 py-1.5 rounded-xl border-2 border-[#DB1A1A]/30">
                        <span className="text-[#DB1A1A] font-extrabold text-xl">{avg}</span>
                        <span className="text-[#8CC7C4] text-xs">/10</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[#8CC7C4] text-xs mb-3">{totalVotes} response{totalVotes !== 1 ? 's' : ''}</p>

                  {/* Rating bar */}
                  {avg && (
                    <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(parseFloat(avg) / 10) * 100}%`, background: '#DB1A1A' }}
                      />
                    </div>
                  )}

                  {/* Comments */}
                  {comments.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-[#8CC7C4] text-xs font-bold uppercase tracking-wide mb-2">
                        Student Comments (Anonymous)
                      </p>
                      <div className="flex flex-col gap-2">
                        {comments.map((c, i) => (
                          <div key={i} className="bg-[#FFF6F6] rounded-xl px-4 py-3 text-sm text-[#2C687B] border-l-4 border-[#8CC7C4]">
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
  )
}