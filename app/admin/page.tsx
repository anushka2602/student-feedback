'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type AcademicRow = { id: string; student_name: string; teacher_name: string; factor: string; rating: number; comment: string; submitted_at: string }
type NonAcademicRow = { id: string; student_name: string; category: string; rating: number; comment: string; submitted_at: string }

const getRatingColor = (r: number) => r >= 8 ? '#2C687B' : r >= 5 ? '#f4a261' : '#DB1A1A'

export default function AdminDashboard() {
  const router = useRouter()
  const [academic, setAcademic] = useState<AcademicRow[]>([])
  const [nonAcademic, setNonAcademic] = useState<NonAcademicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'academic' | 'non-academic'>('academic')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getUser()
    if (!user || user.role !== 'admin') { router.push('/'); return }
    fetchAll()
  }, [router])

  const fetchAll = async () => {
    const [a, na] = await Promise.all([
      supabase.from('academic_feedback').select('*').order('submitted_at', { ascending: false }),
      supabase.from('non_academic_feedback').select('*').order('submitted_at', { ascending: false }),
    ])
    if (a.data) setAcademic(a.data)
    if (na.data) setNonAcademic(na.data)
    setLoading(false)
  }

  const uniqueTeachers = [...new Set(academic.map(r => r.teacher_name))]
  const filteredAcademic = filterTeacher ? academic.filter(r => r.teacher_name === filterTeacher) : academic

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6F6' }}>
        <p style={{ color: '#2C687B' }}>Loading all feedback data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF6F6' }}>

      {/* Red header */}
      <div style={{ background: '#DB1A1A' }} className="px-6 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Admin Panel</p>
              <h2 className="font-display text-2xl font-bold text-white">All Feedback</h2>
            </div>
            <div className="flex gap-2 items-start">
              <Link href="/change-password" className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                Password
              </Link>
              <button onClick={() => { clearUser(); router.push('/') }} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 pb-10">
        <div className="max-w-4xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="card p-4 text-center">
              <p className="font-display font-bold text-3xl" style={{ color: '#DB1A1A' }}>{academic.length}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: '#8CC7C4' }}>Academic Responses</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-display font-bold text-3xl" style={{ color: '#2C687B' }}>{nonAcademic.length}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: '#8CC7C4' }}>Non-Academic Responses</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(['academic', 'non-academic'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: tab === t ? '#2C687B' : 'white',
                  color: tab === t ? 'white' : '#8CC7C4',
                  border: `2px solid ${tab === t ? '#2C687B' : '#f0f0f0'}`,
                }}
              >
                {t === 'academic' ? `Academic (${academic.length})` : `Non-Academic (${nonAcademic.length})`}
              </button>
            ))}
          </div>

          {/* Academic tab */}
          {tab === 'academic' && (
            <>
              <div className="mb-4">
                <select
                  value={filterTeacher}
                  onChange={e => setFilterTeacher(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ border: '2px solid #f0f0f0', color: '#2C687B', fontFamily: 'DM Sans, sans-serif', background: 'white' }}
                >
                  <option value="">All Teachers</option>
                  {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                {filteredAcademic.length === 0 ? (
                  <div className="card p-10 text-center"><p className="text-sm" style={{ color: '#8CC7C4' }}>No academic feedback yet.</p></div>
                ) : filteredAcademic.map(row => (
                  <div key={row.id} className="card p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm" style={{ color: '#2C687B' }}>{row.teacher_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f0f0', color: '#8CC7C4' }}>{row.factor}</span>
                        </div>
                        <p className="text-xs flex items-center gap-1.5" style={{ color: '#8CC7C4' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {row.student_name} · {formatDate(row.submitted_at)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ background: `${getRatingColor(row.rating)}12` }}>
                        <span className="font-display font-bold text-lg leading-none" style={{ color: getRatingColor(row.rating) }}>{row.rating}</span>
                        <span className="text-xs" style={{ color: getRatingColor(row.rating) }}>/10</span>
                      </div>
                    </div>
                    {row.comment && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 text-sm" style={{ background: '#fafafa', borderLeft: '3px solid #8CC7C4', color: '#2C687B' }}>
                        {row.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Non-academic tab */}
          {tab === 'non-academic' && (
            <div className="flex flex-col gap-3">
              {nonAcademic.length === 0 ? (
                <div className="card p-10 text-center"><p className="text-sm" style={{ color: '#8CC7C4' }}>No non-academic feedback yet.</p></div>
              ) : nonAcademic.map(row => (
                <div key={row.id} className="card p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1" style={{ color: '#2C687B' }}>{row.category}</p>
                      <p className="text-xs flex items-center gap-1.5" style={{ color: '#8CC7C4' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {row.student_name} · {formatDate(row.submitted_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ background: `${getRatingColor(row.rating)}12` }}>
                      <span className="font-display font-bold text-lg leading-none" style={{ color: getRatingColor(row.rating) }}>{row.rating}</span>
                      <span className="text-xs" style={{ color: getRatingColor(row.rating) }}>/10</span>
                    </div>
                  </div>
                  {row.comment && (
                    <div className="mt-3 rounded-xl px-4 py-2.5 text-sm" style={{ background: '#fafafa', borderLeft: '3px solid #8CC7C4', color: '#2C687B' }}>
                      {row.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}