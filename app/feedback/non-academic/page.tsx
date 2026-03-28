'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { NON_ACADEMIC_CATEGORIES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

export default function NonAcademicPage() {
  const router = useRouter()
  const [ratedItems, setRatedItems] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') { router.push('/'); return }
    loadRated()
  }, [router])

  const loadRated = () => {
    const stored = localStorage.getItem('nonAcademicRatings')
    if (stored) {
      const all = JSON.parse(stored)
      setRatedItems(all.map((r: { category: string }) => r.category))
    } else {
      setRatedItems([])
    }
  }

  useEffect(() => {
    const handleFocus = () => loadRated()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleSubmit = async () => {
    const user = getUser()
    if (!user) return

    const stored = localStorage.getItem('nonAcademicRatings')
    const allRatings = stored ? JSON.parse(stored) : []

    if (allRatings.length === 0) {
      alert('Please rate at least one category before submitting.')
      return
    }

    if (!confirm('Submit all your ratings? You cannot change them after submitting.')) return

    setSubmitting(true)

    const rows = allRatings.map((r: { category: string; rating: number; comment: string }) => ({
      student_id: user.id,
      student_name: user.name,
      category: r.category,
      rating: r.rating,
      comment: r.comment || '',
    }))

    const { error } = await supabase.from('non_academic_feedback').insert(rows)

    if (error) {
      alert('Error submitting. Please try again.')
      setSubmitting(false)
      return
    }

    localStorage.removeItem('nonAcademicRatings')
    setSubmitted(true)
    setSubmitting(false)
  }

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
          <button onClick={() => router.push('/feedback')} className="text-[#2C687B] text-2xl font-bold p-1 hover:bg-white rounded-lg">←</button>
          <div>
            <h2 className="text-2xl font-extrabold text-[#2C687B]">Non-Academic Feedback</h2>
            <p className="text-[#8CC7C4] text-xs mt-0.5">Click any item to rate it</p>
          </div>
        </div>

        <div className="bg-[#2C687B]/10 border border-[#2C687B]/20 rounded-xl px-4 py-3 mb-5 text-[#2C687B] text-sm font-medium">
          ℹ️ Rating is optional. Rate only what you want, then press Submit.
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {NON_ACADEMIC_CATEGORIES.map((cat) => {
            const rated = ratedItems.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => router.push(`/feedback/non-academic/rate?category=${encodeURIComponent(cat)}`)}
                className="flex items-center justify-between py-4 px-5 rounded-2xl bg-white border-2 shadow-sm hover:shadow-md transition-all hover:border-[#8CC7C4] active:scale-[0.99]"
                style={{ borderColor: rated ? '#8CC7C4' : '#f3f4f6' }}
              >
                <p className="text-[#2C687B] font-semibold text-sm text-left">{cat}</p>
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
          className="w-full py-4 rounded-2xl bg-[#DB1A1A] text-white font-extrabold text-lg shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {submitting ? 'Submitting...' : `Submit Feedback (${ratedItems.length} rated)`}
        </button>
      </div>
    </div>
  )
}