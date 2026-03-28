'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser } from '@/lib/auth'

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
        <span className="text-3xl font-extrabold text-[#DB1A1A]">
          {value}<span className="text-[#8CC7C4] text-base font-medium">/10</span>
        </span>
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
        ✕ Remove rating
      </button>
    </div>
  )
}

function RateNonAcademicForm() {
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
      const all = JSON.parse(stored)
      const existing = all.find((r: { category: string }) => r.category === category)
      if (existing) { setRating(existing.rating); setComment(existing.comment || '') }
    }
  }, [category, router])

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

  return (
    <div className="min-h-screen bg-[#FFF6F6] p-6 pb-32">
      <div className="max-w-md mx-auto">
        <div className="flex items-start gap-3 mb-6">
          <button onClick={() => router.push('/feedback/non-academic')}
            className="text-[#2C687B] text-2xl font-bold p-1 hover:bg-white rounded-lg mt-1">←</button>
          <div>
            <p className="text-[#8CC7C4] text-xs uppercase tracking-widest font-semibold">Rating</p>
            <h2 className="text-xl font-extrabold text-[#2C687B] leading-tight">{category}</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-[#2C687B] font-bold mb-4">{category}</h3>
          <RatingInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Additional comments? (optional)"
            rows={3}
            className="w-full mt-4 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm text-[#2C687B] outline-none focus:border-[#8CC7C4] resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FFF6F6]/95 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-lg transition-all"
            style={{ background: saving ? '#8CC7C4' : '#DB1A1A' }}
          >
            {saving ? '✓ Saved! Going back...' : 'Save Rating'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RateNonAcademicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF6F6] flex items-center justify-center"><p className="text-[#2C687B]">Loading...</p></div>}>
      <RateNonAcademicForm />
    </Suspense>
  )
}