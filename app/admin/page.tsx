'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type AcademicRow    = { id: string; student_name: string; teacher_name: string; factor: string; rating: number; comment: string; submitted_at: string }
type NonAcademicRow = { id: string; student_name: string; category: string; rating: number; comment: string; submitted_at: string }

const ratingColor = (r: number) => r >= 8 ? 'var(--teal)' : r >= 5 ? '#f97316' : '#DB1A1A'
const ratingBg    = (r: number) => r >= 8 ? 'var(--teal-bg)' : r >= 5 ? 'rgba(249,115,22,0.1)' : 'var(--red-bg)'

export default function AdminDashboard() {
  const router = useRouter()
  const [academic, setAcademic]       = useState<AcademicRow[]>([])
  const [nonAcademic, setNonAcademic] = useState<NonAcademicRow[]>([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState<'academic' | 'non-academic'>('academic')
  const [filterTeacher, setFilter]    = useState('')
  const [mounted, setMounted]         = useState(false)

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

  const uniqueTeachers   = [...new Set(academic.map(r => r.teacher_name))]
  const filteredAcademic = filterTeacher ? academic.filter(r => r.teacher_name === filterTeacher) : academic

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Loading feedback data...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <div className="top-nav">
        <div className="top-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#DB1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Admin Panel</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <Link href="/change-password" className="btn-ghost" style={{ color: 'var(--teal)', borderColor: 'var(--teal-border)', background: 'var(--teal-bg)' }}>Pass</Link>
            <button onClick={() => { clearUser(); router.push('/') }} className="btn-ghost">Out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>All Feedback</h1>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Complete overview of all student submissions</p>
        </div>

        {/* Stats — 2 col on mobile, 3 on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }} className="sm:grid-cols-3">
          {[
            { label: 'Academic',     value: academic.length,    color: '#DB1A1A' },
            { label: 'Non-Academic', value: nonAcademic.length, color: 'var(--teal)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{s.label} responses</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['academic', 'non-academic'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter,sans-serif', border: 'none', transition: 'all 0.15s',
                background: tab === t ? 'var(--text)' : 'var(--bg2)',
                color:      tab === t ? 'var(--bg)'   : 'var(--text3)',
                boxShadow:  tab === t ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {t === 'academic' ? `Academic (${academic.length})` : `Non-Academic (${nonAcademic.length})`}
            </button>
          ))}
        </div>

        {/* Filter */}
        {tab === 'academic' && (
          <div style={{ marginBottom: '14px' }}>
            <select
              value={filterTeacher}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)', fontFamily: 'Inter,sans-serif', background: 'var(--bg2)', outline: 'none', cursor: 'pointer', maxWidth: '100%', width: '100%' }}
            >
              <option value="">All Teachers</option>
              {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {/* Academic rows */}
        {tab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredAcademic.length === 0 ? (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No academic feedback yet.</p>
              </div>
            ) : filteredAcademic.map(row => (
              <div key={row.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{row.teacher_name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{row.factor}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                      {row.student_name} · {fmtDate(row.submitted_at)}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '10px', background: ratingBg(row.rating), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1, color: ratingColor(row.rating) }}>{row.rating}</span>
                    <span style={{ fontSize: '10px', color: ratingColor(row.rating) }}>/10</span>
                  </div>
                </div>
                {row.comment && (
                  <div style={{ marginTop: '10px', background: 'var(--bg3)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: 'var(--text2)', borderLeft: '3px solid var(--teal-light)' }}>
                    {row.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Non-academic rows */}
        {tab === 'non-academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nonAcademic.length === 0 ? (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No non-academic feedback yet.</p>
              </div>
            ) : nonAcademic.map(row => (
              <div key={row.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{row.category}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{row.student_name} · {fmtDate(row.submitted_at)}</div>
                  </div>
                  <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '10px', background: ratingBg(row.rating), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1, color: ratingColor(row.rating) }}>{row.rating}</span>
                    <span style={{ fontSize: '10px', color: ratingColor(row.rating) }}>/10</span>
                  </div>
                </div>
                {row.comment && (
                  <div style={{ marginTop: '10px', background: 'var(--bg3)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: 'var(--text2)', borderLeft: '3px solid var(--teal-light)' }}>
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