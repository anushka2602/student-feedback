'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { NON_ACADEMIC_CATEGORIES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const CATEGORY_ICONS: Record<string, string> = {
  'Infrastructure': '🏛️',
  'Cleanliness and Hygiene': '🧹',
  'Peer Interaction': '🤝',
  'Safety and Security': '🔒',
  'Availability of Wi-Fi': '📶',
  'Cleanliness in Food and Drinking Water': '🥗',
  'Extracurricular Opportunities': '🎭',
  'Administration and Management': '📋',
}

export default function NonAcademicPage() {
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
    const stored = localStorage.getItem('nonAcademicRatings')
    if (stored) setRatedItems(JSON.parse(stored).map((r: { category: string }) => r.category))
    else setRatedItems([])
  }

  const handleSubmit = async () => {
    const user = getUser()
    if (!user) return
    const stored = localStorage.getItem('nonAcademicRatings')
    const allRatings = stored ? JSON.parse(stored) : []
    if (allRatings.length === 0) { alert('Please rate at least one category before submitting.'); return }
    if (!confirm('Submit all your ratings?')) return
    setSubmitting(true)
    const rows = allRatings.map((r: { category: string; rating: number; comment: string }) => ({
      student_id: user.id, student_name: user.name, category: r.category, rating: r.rating, comment: r.comment || '',
    }))
    const { error } = await supabase.from('non_academic_feedback').insert(rows)
    if (error) { alert('Error submitting. Please try again.'); setSubmitting(false); return }
    localStorage.removeItem('nonAcademicRatings')
    setSubmitted(true)
    setSubmitting(false)
  }

  if (!mounted) return null

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#FFF6F6' }}>
        <div className="card p-10 text-center w-full" style={{ maxWidth: '360px' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#edf7f7' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#2C687B' }}>Submitted!</h2>
          <p className="text-sm mb-6" style={{ color: '#8CC7C4' }}>Your feedback has been recorded. Thank you!</p>
          <button onClick={() => router.push('/feedback')} className="w-full py-3.5 rounded-xl text-white font-semibold text-sm" style={{ background: '#2C687B' }}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const progress = Math.round((ratedItems.length / NON_ACADEMIC_CATEGORIES.length) * 100)

  return (
    <div className="min-h-screen" style={{ background: '#FFF6F6' }}>

      {/* Teal header */}
      <div style={{ background: '#2C687B' }} className="px-6 pt-10 pb-16">
        <div className="max-w-md mx-auto">
          <button onClick={() => router.push('/feedback')} className="flex items-center gap-2 text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#8CC7C4' }}>Non-Academic Feedback</p>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Rate Campus Life</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'white' }} />
            </div>
            <span className="text-white text-xs font-semibold">{ratedItems.length}/{NON_ACADEMIC_CATEGORIES.length}</span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 pb-32">
        <div className="max-w-md mx-auto">

          {/* Info banner */}
          <div className="card p-4 mb-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#edf7f7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="text-sm" style={{ color: '#2C687B' }}>Rating is <strong>optional</strong>. Rate only what you want, then tap Submit.</p>
          </div>

          {/* Category list */}
          <div className="flex flex-col gap-3 mb-6">
            {NON_ACADEMIC_CATEGORIES.map((cat) => {
              const rated = ratedItems.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => router.push(`/feedback/non-academic/rate?category=${encodeURIComponent(cat)}`)}
                  className="card flex items-center gap-4 p-4 text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                  style={rated ? { borderLeft: '4px solid #8CC7C4' } : {}}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: rated ? '#edf7f7' : '#f8f8f8' }}>
                    {CATEGORY_ICONS[cat] || '📊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#2C687B' }}>{cat}</p>
                  </div>
                  {rated ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: '#edf7f7' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2C687B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-xs font-bold" style={{ color: '#2C687B' }}>Rated</span>
                    </div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'rgba(255,246,246,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #f0f0f0' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || ratedItems.length === 0}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40"
            style={{ background: '#2C687B', boxShadow: ratedItems.length > 0 ? '0 8px 24px rgba(44,104,123,0.3)' : 'none' }}
          >
            {submitting ? 'Submitting...' : `Submit Ratings (${ratedItems.length} rated)`}
          </button>
        </div>
      </div>

    </div>
  )
}