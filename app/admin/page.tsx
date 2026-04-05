'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type AcademicRow = { id: string; student_name: string; teacher_name: string; factor: string; rating: number; comment: string; submitted_at: string }
type NonAcademicRow = { id: string; student_name: string; category: string; rating: number; comment: string; submitted_at: string }

const getRatingColor = (r: number) => (r >= 8 ? '#2C687B' : r >= 5 ? '#ea580c' : '#DB1A1A')
const getRatingBg = (r: number) =>
  r >= 8 ? 'bg-teal-50 dark:bg-teal-950/55' : r >= 5 ? 'bg-orange-50 dark:bg-orange-950/45' : 'bg-rose-50 dark:bg-rose-950/45'

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
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
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

  const uniqueTeachers = [...new Set(academic.map((r) => r.teacher_name))]
  const filteredAcademic = filterTeacher ? academic.filter((r) => r.teacher_name === filterTeacher) : academic

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse-soft text-sm text-slate-500 dark:text-slate-400">Loading all feedback data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <header className="glass-nav sticky top-0 z-10 px-4 sm:px-6">
        <div className="mx-auto flex min-h-14 max-w-4xl items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DB1A1A] shadow-md shadow-rose-900/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/change-password" className="btn-header-accent">
              Password
            </Link>
            <button
              type="button"
              onClick={() => {
                clearUser()
                router.push('/')
              }}
              className="btn-header-muted"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">All Feedback</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete overview of all student submissions</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Academic Responses', value: academic.length, accent: 'text-[#DB1A1A]', bar: 'bg-[#DB1A1A]/15' },
            { label: 'Non-Academic Responses', value: nonAcademic.length, accent: 'text-[#2C687B]', bar: 'bg-[#2C687B]/15' },
            {
              label: 'Total Submissions',
              value: academic.length + nonAcademic.length,
              accent: 'text-slate-700 dark:text-slate-200',
              bar: 'bg-slate-200/80 dark:bg-slate-600/50',
            },
          ].map((stat) => (
            <div key={stat.label} className="surface relative overflow-hidden rounded-2xl p-5">
              <div className={`absolute inset-x-0 top-0 h-1 ${stat.bar}`} aria-hidden />
              <div className={`text-3xl font-bold tabular-nums ${stat.accent}`}>{stat.value}</div>
              <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 inline-flex max-w-full flex-wrap rounded-xl border border-slate-200/80 bg-white/60 p-1 shadow-sm backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-900/50">
          {(['academic', 'non-academic'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all sm:px-4 ${
                tab === t
                  ? 'bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t === 'academic' ? `Academic (${academic.length})` : `Non-Academic (${nonAcademic.length})`}
            </button>
          ))}
        </div>

        {tab === 'academic' && (
          <>
            <div className="mb-4">
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="input-field max-w-full cursor-pointer py-2.5 text-sm shadow-sm sm:max-w-xs dark:text-slate-100"
              >
                <option value="">All Teachers</option>
                {uniqueTeachers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {filteredAcademic.length === 0 ? (
                <div className="surface rounded-2xl px-6 py-14 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No academic feedback yet.</p>
                </div>
              ) : (
                filteredAcademic.map((row) => (
                  <article key={row.id} className="surface rounded-2xl p-5 transition-shadow hover:shadow-md sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.teacher_name}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {row.factor}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {row.student_name} · {formatDate(row.submitted_at)}
                        </div>
                      </div>
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${getRatingBg(row.rating)} sm:h-[52px] sm:w-[52px]`}
                      >
                        <span className="text-lg font-bold leading-none" style={{ color: getRatingColor(row.rating) }}>
                          {row.rating}
                        </span>
                        <span className="text-[10px] font-semibold opacity-80" style={{ color: getRatingColor(row.rating) }}>
                          /10
                        </span>
                      </div>
                    </div>
                    {row.comment ? (
                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 py-3 pl-4 pr-3 text-sm leading-relaxed text-slate-600 border-l-[3px] border-l-[#8CC7C4] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                        {row.comment}
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'non-academic' && (
          <div className="flex flex-col gap-3">
            {nonAcademic.length === 0 ? (
              <div className="surface rounded-2xl px-6 py-14 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">No non-academic feedback yet.</p>
              </div>
            ) : (
              nonAcademic.map((row) => (
                <article key={row.id} className="surface rounded-2xl p-5 transition-shadow hover:shadow-md sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{row.category}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {row.student_name} · {formatDate(row.submitted_at)}
                      </div>
                    </div>
                    <div
                      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${getRatingBg(row.rating)} sm:h-[52px] sm:w-[52px]`}
                    >
                      <span className="text-lg font-bold leading-none" style={{ color: getRatingColor(row.rating) }}>
                        {row.rating}
                      </span>
                      <span className="text-[10px] font-semibold opacity-80" style={{ color: getRatingColor(row.rating) }}>
                        /10
                      </span>
                    </div>
                  </div>
                  {row.comment ? (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 py-3 pl-4 pr-3 text-sm leading-relaxed text-slate-600 border-l-[3px] border-l-[#8CC7C4] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                      {row.comment}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
