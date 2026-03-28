'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [academic, setAcademic] = useState<{
    id: string
    student_name: string
    teacher_name: string
    factor: string
    rating: number
    comment: string
    submitted_at: string
  }[]>([])
  const [nonAcademic, setNonAcademic] = useState<{
    id: string
    student_name: string
    category: string
    rating: number
    comment: string
    submitted_at: string
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'academic' | 'non-academic'>('academic')
  const [filterTeacher, setFilterTeacher] = useState('')

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6F6] flex items-center justify-center">
        <p className="text-[#2C687B] font-semibold">Loading all feedback data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF6F6] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[#8CC7C4] text-xs uppercase tracking-widest font-semibold">Admin Panel</p>
            <h2 className="text-2xl font-extrabold text-[#2C687B] mt-1">All Feedback</h2>
            <p className="text-[#8CC7C4] text-sm mt-1">
              {academic.length} academic · {nonAcademic.length} non-academic responses
            </p>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(['academic', 'non-academic'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-all"
              style={{
                background: tab === t ? '#2C687B' : 'white',
                color: tab === t ? 'white' : '#6b7280',
                border: `2px solid ${tab === t ? '#2C687B' : '#e5e7eb'}`,
              }}
            >
              {t === 'academic' ? `🎓 Academic (${academic.length})` : `🏫 Non-Academic (${nonAcademic.length})`}
            </button>
          ))}
        </div>

        {/* Academic Tab */}
        {tab === 'academic' && (
          <>
            {/* Teacher filter */}
            <div className="mb-4">
              <select
                value={filterTeacher}
                onChange={e => setFilterTeacher(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-[#2C687B] font-medium outline-none focus:border-[#8CC7C4] bg-white text-sm"
              >
                <option value="">All Teachers</option>
                {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {filteredAcademic.length === 0 ? (
                <p className="text-center text-[#8CC7C4] py-10">No academic feedback yet.</p>
              ) : filteredAcademic.map(row => (
                <div key={row.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2C687B] truncate">{row.teacher_name}</p>
                      <p className="text-[#8CC7C4] text-sm">{row.factor}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        👤 {row.student_name} · {formatDate(row.submitted_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 bg-[#FFF6F6] border-2 border-[#DB1A1A]/30 rounded-xl px-3 py-1.5 text-center">
                      <span className="text-[#DB1A1A] font-extrabold text-lg">{row.rating}</span>
                      <span className="text-[#8CC7C4] text-xs">/10</span>
                    </div>
                  </div>
                  {row.comment && (
                    <div className="mt-3 bg-[#FFF6F6] rounded-xl px-4 py-2.5 text-sm text-[#2C687B] border-l-4 border-[#8CC7C4]">
                      💬 {row.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Non-Academic Tab */}
        {tab === 'non-academic' && (
          <div className="flex flex-col gap-3">
            {nonAcademic.length === 0 ? (
              <p className="text-center text-[#8CC7C4] py-10">No non-academic feedback yet.</p>
            ) : nonAcademic.map(row => (
              <div key={row.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C687B]">{row.category}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      👤 {row.student_name} · {formatDate(row.submitted_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 bg-[#FFF6F6] border-2 border-[#DB1A1A]/30 rounded-xl px-3 py-1.5 text-center">
                    <span className="text-[#DB1A1A] font-extrabold text-lg">{row.rating}</span>
                    <span className="text-[#8CC7C4] text-xs">/10</span>
                  </div>
                </div>
                {row.comment && (
                  <div className="mt-3 bg-[#FFF6F6] rounded-xl px-4 py-2.5 text-sm text-[#2C687B] border-l-4 border-[#8CC7C4]">
                    💬 {row.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}