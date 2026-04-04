'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type AcademicRow = { id: string; student_name: string; teacher_name: string; factor: string; rating: number; comment: string; submitted_at: string }
type NonAcademicRow = { id: string; student_name: string; category: string; rating: number; comment: string; submitted_at: string }

const getRatingColor = (r: number) => r >= 8 ? '#2C687B' : r >= 5 ? '#f97316' : '#DB1A1A'
const getRatingBg = (r: number) => r >= 8 ? '#f0f9fa' : r >= 5 ? '#fff7ed' : '#fff5f5'

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
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: '14px' }}>Loading all feedback data...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* Nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #eaeaea', padding: '0 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#DB1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Admin Panel</span>
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

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>All Feedback</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Complete overview of all student submissions</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Academic Responses', value: academic.length, color: '#DB1A1A' },
            { label: 'Non-Academic Responses', value: nonAcademic.length, color: '#2C687B' },
            { label: 'Total Submissions', value: academic.length + nonAcademic.length, color: '#555' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['academic', 'non-academic'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', border: 'none',
                background: tab === t ? '#1a1a2e' : 'white',
                color: tab === t ? 'white' : '#888',
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'academic' ? `Academic (${academic.length})` : `Non-Academic (${nonAcademic.length})`}
            </button>
          ))}
        </div>

        {/* Academic */}
        {tab === 'academic' && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <select
                value={filterTeacher}
                onChange={e => setFilterTeacher(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #eaeaea', fontSize: '13px', color: '#1a1a2e', fontFamily: 'Inter, sans-serif', background: 'white', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Teachers</option>
                {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredAcademic.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: '#aaa', fontSize: '14px' }}>No academic feedback yet.</p>
                </div>
              ) : filteredAcademic.map(row => (
                <div key={row.id} style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{row.teacher_name}</span>
                        <span style={{ fontSize: '11px', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: '100px' }}>{row.factor}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#aaa' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {row.student_name} · {formatDate(row.submitted_at)}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '12px', background: getRatingBg(row.rating), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1, color: getRatingColor(row.rating) }}>{row.rating}</span>
                      <span style={{ fontSize: '10px', color: getRatingColor(row.rating) }}>/10</span>
                    </div>
                  </div>
                  {row.comment && (
                    <div style={{ marginTop: '12px', background: '#f8f8f8', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#555', borderLeft: '3px solid #8CC7C4' }}>
                      {row.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Non-Academic */}
        {tab === 'non-academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {nonAcademic.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#aaa', fontSize: '14px' }}>No non-academic feedback yet.</p>
              </div>
            ) : nonAcademic.map(row => (
              <div key={row.id} style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>{row.category}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#aaa' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {row.student_name} · {formatDate(row.submitted_at)}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '12px', background: getRatingBg(row.rating), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1, color: getRatingColor(row.rating) }}>{row.rating}</span>
                    <span style={{ fontSize: '10px', color: getRatingColor(row.rating) }}>/10</span>
                  </div>
                </div>
                {row.comment && (
                  <div style={{ marginTop: '12px', background: '#f8f8f8', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#555', borderLeft: '3px solid #8CC7C4' }}>
                    {row.comment}
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