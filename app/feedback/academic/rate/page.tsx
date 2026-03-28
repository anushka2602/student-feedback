'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { TEACHER_FACTORS } from '@/lib/constants'

interface FactorRating {
  factor: string
  rating: number | null
  comment: string
}

function RatingInput({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => onChange(5)}
        className="w-full py-3 border-2 border-dashed border-[#8CC7C4] rounded-xl text-[#8CC7C4] text-sm font-semibold hover:border-[#DB1A1A] hover:text-[#DB1A1A] transition-colors"
      >
        + Tap to give a rating
      </button>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#8CC7C4]">1 = Poor</span>
        <span className="text-2xl font-extrabold text-[#DB1A1A]">{value}<span className="text-[#8CC7C4] text-sm font-medium">/10</span></span>
        <span className="text-xs text-[#8CC7C4]">10 = Excellent</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-xs text-gray-400 mt-2 hover:text-[#DB1A1A] transition-colors"
      >
        ✕ Remove this rating
      </button>
    </div>
  )
}

function RateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = decodeURIComponent(searchParams.get('name') || '')
  const isTimetable = name === 'Timetable Management'
  const factors = isTimetable ? ['Timetable Management'] : TEACHER_FACTORS

  const [ratings, setRatings] = useState<FactorRating[]>(
    factors.map(f => ({ factor: f, rating: null, comment: '' }))
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') { router.push('/'); return }

    // Load existing ratings if already saved
    const stored = localStorage.getItem('academicRatings')
    if (stored) {
      const all = JSON.parse(stored)
      const existing = all.find((r: { teacher_name: string }) => r.teacher_name === name)
      if (existing) {
        setRatings(
          factors.map(f => {
            const found = existing.factors.find((ef: FactorRating) => ef.factor === f)
            return found || { factor: f, rating: null, comment: '' }
          })
        )
      }
    }
  }, [name, router])

  const updateRating = (index: number, rating: number | null) => {
    setRatings(prev => prev.map((r, i) => i === index ? { ...r, rating } : r))
  }

  const updateComment = (index: number, comment: string) => {
    setRatings(prev => prev.map((r, i) => i === index ? { ...r, comment } : r))
  }

  const handleSave = () => {
    const ratedFactors = ratings.filter(r => r.rating !== null)
    if (ratedFactors.length === 0) {
      alert('Please give at least one rating before saving.')
      return
    }

    const stored = localStorage.getItem('academicRatings')
    let all = stored ? JSON.parse(stored) : []
    all = all.filter((r: { teacher_name: string }) => r.teacher_name !== name)
    all.push({ teacher_name: name, factors: ratedFactors })
    localStorage.setItem('academicRatings', JSON.stringify(all))

    setSaving(true)
    setTimeout(() => router.push('/feedback/academic'), 800)
  }

  const ratedCount = ratings.filter(r => r.rating !== null).length

  return (
    <div className="min-h-screen bg-[#FFF6F6] p-6 pb-32">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <button onClick={() => router.push('/feedback/academic')}
            className="text-[#2C687B] text-2xl font-bold p-1 hover:bg-white rounded-lg mt-1">←</button>
          <div>
            <p className="text-[#8CC7C4] text-xs uppercase tracking-widest font-semibold">Rating</p>
            <h2 className="text-xl font-extrabold text-[#2C687B] leading-tight">{name}</h2>
            {!isTimetable && (
              <p className="text-[#8CC7C4] text-xs mt-1">{ratedCount} of {factors.length} factors rated</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {ratings.map((item, index) => (
            <div key={item.factor} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-[#2C687B] font-bold mb-4">{item.factor}</h3>
              <RatingInput value={item.rating} onChange={(v) => updateRating(index, v)} />
              <textarea
                value={item.comment}
                onChange={e => updateComment(index, e.target.value)}
                placeholder="Additional comments? (optional)"
                rows={2}
                className="w-full mt-4 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm text-[#2C687B] outline-none focus:border-[#8CC7C4] resize-none transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FFF6F6]/95 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-lg transition-all"
            style={{ background: saving ? '#8CC7C4' : '#DB1A1A' }}
          >
            {saving ? '✓ Saved! Going back...' : `Save (${ratedCount} rated)`}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Only rated factors will be saved. Rating is optional.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RateAcademicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF6F6] flex items-center justify-center">
        <p className="text-[#2C687B]">Loading...</p>
      </div>
    }>
      <RateForm />
    </Suspense>
  )
}