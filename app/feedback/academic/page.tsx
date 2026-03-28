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
    if (stored) {
      const all = JSON.parse(stored)
      setRatedItems(all.map((r: { teacher_name: string }) => r.teacher_name))
    } else {
      setRatedItems([])
    }
  }

  const handleSubmit = async () => {
    const user = getUser()
    if (!user) return

    const stored = localStorage.getItem('academicRatings')
    const allRatings = stored ? JSON.parse(stored) : []

    if (allRatings.length === 0) {
      alert('Please rate at least one item before submitting.')
      return
    }

    if (!confirm('Submit all your ratings? You cannot change them after submitting.')) return

    setSubmitting(true)

    const rows: {
      student_id: string
      student_name: string
      teacher_name: string
      factor: string
      rating: number
      comment: string
    }[] = []

    for (const item of allRatings) {
      for (const f of item.factors) {
        rows.push({
          student_id: user.id,
          student_name: user.name,
          teacher_name: item.teacher_name,
          factor: f.factor,
          rating: f.rating,
          comment: f.comment || '',
        })
      }
    }

    const { error } = await supabase.from('academic_feedback').insert(rows)

    if (error) {
      alert('Error submitting. Please try again.')
      setSubmitting(false)
      return
    }

    localStorage.removeItem('academicRatings')
    setSubmitted(true)
    setSubmitting(false)
  }

  if (!mounted) return null

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF6F6] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-7xl mb-5">🎉</div>
          <h2 className="text-3xl font-extrabold text-[#2C687B] mb-2">Submitted!</h2>
          <p className="text-[#8CC7C4] mb-8">Thank you for your valuable feedback.</p>
          <button onClick={() => router.push('/feedback')}
            className="bg-[#2C687B] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF6F6] p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/feedback')} className="text-[#2C687B] text-2xl font-bold p-1 hover:bg-white rounded-lg transition-colors">←</button>
          <div>
            <h2 className="text-2xl font-extrabold text-[#2C687B]">Academic Feedback</h2>
            <p className="text-[#8CC7C4] text-xs mt-0.5">Click any item to rate it</p>
          </div>
        </div>

        <div className="bg-[#DB1A1A]/10 border border-[#DB1A1A]/20 rounded-xl px-4 py-3 mb-5 text-[#DB1A1A] text-sm font-medium">
          ℹ️ Rating is optional. Rate only what you want, then press Submit.
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {ALL_ITEMS.map((item) => {
            const rated = ratedItems.includes(item)
            const isTimetable = item === 'Timetable Management'
            return (
              <button
                key={item}
                onClick={() => router.push(`/feedback/academic/rate?name=${encodeURIComponent(item)}`)}
                className="flex items-center justify-between py-4 px-5 rounded-2xl bg-white border-2 shadow-sm hover:shadow-md transition-all hover:border-[#8CC7C4] active:scale-[0.99]"
                style={{ borderColor: rated ? '#8CC7C4' : '#f3f4f6' }}
              >
                <div className="text-left">
                  <p className="text-[#2C687B] font-semibold text-sm">{item}</p>
                  {!isTimetable && (
                    <p className="text-[#8CC7C4] text-xs mt-0.5">8 rating factors</p>
                  )}
                </div>
                {rated ? (
                  <span className="flex items-center gap-1 bg-[#8CC7C4]/20 text-[#2C687B] text-xs font-bold px-3 py-1.5 rounded-full">
                    ✓ Rated
                  </span>
                ) : (
                  <span className="text-gray-300 text-sm font-medium">Rate →</span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-[#DB1A1A] text-white font-extrabold text-lg shadow-lg hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all"
        >
          {submitting ? 'Submitting...' : `Submit Feedback (${ratedItems.length} rated)`}
        </button>
      </div>
    </div>
  )
}