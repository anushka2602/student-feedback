'use client'
import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { ScoreBar, ScoreNumber } from '@/components/Score'
import { TopBar } from '@/components/TopBar'
import { Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { useApi } from '@/lib/api'
import { ANONYMOUS_MODE } from '@/lib/config'
import { ALL_FACTORS, NON_ACADEMIC_CATEGORIES, TEACHERS, TIMETABLE } from '@/lib/constants'
import { fillVar, fmt1, plural } from '@/lib/rating'

interface Summary {
  students: number; academicResponses: number; nonAcademicResponses: number; academicAverage: number | null; nonAcademicAverage: number | null
  teachers: { name: string; average: number; responses: number; respondents: number }[]
  categories: { name: string; average: number; responses: number }[]
}
interface Row { id: string; student_name?: string; teacher_name?: string; factor?: string; category?: string; rating: number; comment: string; submitted_at: string }
interface Page { rows: Row[]; total: number; page: number; pageSize: number }
type Tab = 'overview' | 'academic' | 'non-academic'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return <Card className="p-4"><p className="text-[13px] text-ink-3">{label}</p><p className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</p>{sub && <p className="text-[13px] text-ink-3">{sub}</p>}</Card>
}

function Overview({ go }: { go: (tab: Tab, teacher?: string, category?: string) => void }) {
  const { data, error, loading, reload } = useApi<Summary>('/api/admin/summary')
  if (error) return <EmptyState icon="alert" title="Could not load the overview" action={<Button onClick={reload}>Try again</Button>}>{error}</EmptyState>
  if (loading || !data) return <div className="grid gap-3 sm:grid-cols-4" aria-busy="true">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}<Skeleton className="h-64 sm:col-span-4" /></div>
  const rowBtn = 'grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-lg px-3 py-3 text-left hover:bg-surface-2 sm:grid-cols-[minmax(0,14rem)_1fr_auto]'
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Students who responded" value={data.students} />
        <Stat label="Teacher ratings" value={data.academicResponses} sub={`Average ${fmt1(data.academicAverage)}`} />
        <Stat label="Campus ratings" value={data.nonAcademicResponses} sub={`Average ${fmt1(data.nonAcademicAverage)}`} />
        <Stat label="Teachers rated" value={`${data.teachers.filter(t => t.name !== TIMETABLE).length}/${TEACHERS.length}`} />
      </div>
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Teachers and timetable</h2>
        <Card className="p-1.5">
          {data.teachers.length === 0 ? <p className="p-6 text-center text-sm text-ink-3">No ratings yet.</p> : data.teachers.map(t => (
            <button key={t.name} className={rowBtn} onClick={() => go('academic', t.name)}>
              <span className="min-w-0"><span className="block truncate font-medium">{t.name}</span><span className="text-[13px] text-ink-3">{plural(t.respondents, 'student')}, {plural(t.responses, 'rating')}</span></span>
              <span className="sm:order-last"><ScoreNumber value={t.average} /></span>
              <ScoreBar value={t.average} className="col-span-2 sm:col-span-1" />
            </button>
          ))}
        </Card>
      </section>
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Campus life</h2>
        <Card className="p-1.5">
          {data.categories.length === 0 ? <p className="p-6 text-center text-sm text-ink-3">No ratings yet.</p> : data.categories.map(c => (
            <button key={c.name} className={rowBtn} onClick={() => go('non-academic', undefined, c.name)}>
              <span className="min-w-0"><span className="block truncate font-medium">{c.name}</span><span className="text-[13px] text-ink-3">{plural(c.responses, 'rating')}</span></span>
              <span className="sm:order-last"><ScoreNumber value={c.average} /></span>
              <ScoreBar value={c.average} className="col-span-2 sm:col-span-1" />
            </button>
          ))}
        </Card>
      </section>
    </div>
  )
}

function Responses({ type, teacher, category, setTeacher, setCategory }: {
  type: 'academic' | 'non-academic'; teacher: string; category: string; setTeacher: (v: string) => void; setCategory: (v: string) => void
}) {
  const [factor, setFactor] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('new')
  const [withComments, setWithComments] = useState(false)
  const [page, setPage] = useState(1)
  const academic = type === 'academic'
  const qs = new URLSearchParams({ type, page: String(page), sort })
  if (academic && teacher) qs.set('teacher', teacher)
  if (academic && factor) qs.set('factor', factor)
  if (!academic && category) qs.set('category', category)
  if (q.trim()) qs.set('q', q.trim())
  if (withComments) qs.set('withComments', '1')
  const { data, error, loading, reload } = useApi<Page>(`/api/admin/feedback?${qs}`)
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1) }
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const sel = 'input min-h-10 py-2 text-sm'

  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[repeat(4,1fr)_auto]">
        {academic ? (
          <>
            <select aria-label="Teacher" className={sel} value={teacher} onChange={e => reset(setTeacher)(e.target.value)}><option value="">All teachers</option>{[...TEACHERS, TIMETABLE].map(t => <option key={t}>{t}</option>)}</select>
            <select aria-label="Factor" className={sel} value={factor} onChange={e => reset(setFactor)(e.target.value)}><option value="">All factors</option>{ALL_FACTORS.map(t => <option key={t}>{t}</option>)}</select>
          </>
        ) : (
          <select aria-label="Category" className={`${sel} sm:col-span-2`} value={category} onChange={e => reset(setCategory)(e.target.value)}><option value="">All categories</option>{NON_ACADEMIC_CATEGORIES.map(t => <option key={t}>{t}</option>)}</select>
        )}
        <select aria-label="Sort" className={sel} value={sort} onChange={e => reset(setSort)(e.target.value)}><option value="new">Newest first</option><option value="high">Highest rated</option><option value="low">Lowest rated</option></select>
        <div className="relative"><Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input aria-label="Search comments" className={`${sel} pl-9`} placeholder="Search comments" value={q} onChange={e => reset(setQ)(e.target.value)} /></div>
        <a href={`/api/admin/export?type=${type}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-line-strong bg-surface px-3.5 text-sm font-semibold hover:bg-surface-2"><Icon name="download" size={16} />Export CSV</a>
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" className="size-4 accent-[var(--brand)]" checked={withComments} onChange={e => reset(setWithComments)(e.target.checked)} />Only show ratings with comments</label>

      {error ? <EmptyState icon="alert" title="Could not load feedback" action={<Button onClick={reload}>Try again</Button>}>{error}</EmptyState>
      : !data ? <div className="space-y-2" aria-busy="true">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      : data.rows.length === 0 ? <EmptyState icon="search" title="Nothing matches">Try clearing a filter or the search.</EmptyState>
      : (
        <>
          <ul className={`flex flex-col gap-2 transition-opacity ${loading ? 'opacity-50' : ''}`} aria-busy={loading}>
            {data.rows.map(r => (
              <li key={r.id}><Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.teacher_name ?? r.category}</p>
                    <p className="text-[13px] text-ink-3">{[r.factor, !ANONYMOUS_MODE && r.student_name, fmtDate(r.submitted_at)].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: fillVar(r.rating) }}>{r.rating}</span>
                </div>
                {r.comment && <p className="mt-3 break-words rounded-lg bg-surface-2 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink-2">{r.comment}</p>}
              </Card></li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm text-ink-3">
            <span>{(page - 1) * data.pageSize + 1}–{(page - 1) * data.pageSize + data.rows.length} of {data.total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><Icon name="chevron-left" size={15} />Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next<Icon name="chevron-right" size={15} /></Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [teacher, setTeacher] = useState('')
  const [category, setCategory] = useState('')
  const tabs: [Tab, string][] = [['overview', 'Overview'], ['academic', 'Teacher ratings'], ['non-academic', 'Campus ratings']]

  return (
    <>
      <TopBar wide title="Admin" />
      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Feedback</h1>
        <div role="tablist" aria-label="Sections" className="mb-6 mt-4 inline-flex w-full rounded-control bg-surface-2 p-1 sm:w-auto">
          {tabs.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${tab === k ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'}`}>{label}</button>
          ))}
        </div>
        {tab === 'overview' && <Overview go={(t, te, ca) => { setTab(t); setTeacher(te ?? ''); setCategory(ca ?? '') }} />}
        {tab !== 'overview' && <Responses key={tab} type={tab} teacher={teacher} category={category} setTeacher={setTeacher} setCategory={setCategory} />}
      </main>
    </>
  )
}
