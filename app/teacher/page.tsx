'use client'
import { useState } from 'react'
import { Histogram, ScoreBar, ScoreNumber } from '@/components/Score'
import { useSession } from '@/components/SessionProvider'
import { TopBar } from '@/components/TopBar'
import { Button, Card, EmptyState, Skeleton, initials } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { useApi } from '@/lib/api'
import { plural, ratingBand, textVar } from '@/lib/rating'

interface Factor { factor: string; average: number; count: number; comments: { comment: string; rating: number }[] }
interface Summary { name: string; overall: number | null; responses: number; respondents: number; distribution: number[]; factors: Factor[] }

function FactorCard({ f }: { f: Factor }) {
  const [open, setOpen] = useState(false)
  const [all, setAll] = useState(false)
  const shown = all ? f.comments : f.comments.slice(0, 5)
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{f.factor}</h3>
        <ScoreNumber value={f.average} />
      </div>
      <ScoreBar value={f.average} className="mt-2.5" />
      <div className="mt-2 flex items-center justify-between text-[13px] text-ink-3">
        <span>{f.count} {f.count === 1 ? 'rating' : 'ratings'}</span>
        {f.comments.length > 0 && (
          <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className="-mr-2 flex min-h-9 items-center gap-1 rounded-full px-2.5 font-medium text-brand-text hover:bg-brand-soft">
            {f.comments.length} {f.comments.length === 1 ? 'comment' : 'comments'}
            <Icon name="chevron-down" size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {open && (
        <ul className="anim-fade mt-3 flex flex-col gap-2 border-t border-line pt-3">
          {shown.map((c, i) => (
            <li key={i} className="flex gap-3 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink-2">
              <span className="mt-0.5 shrink-0 text-xs font-bold tabular-nums" style={{ color: textVar(c.rating) }}>{c.rating}</span>
              <span className="min-w-0 break-words">{c.comment}</span>
            </li>
          ))}
          {!all && f.comments.length > 5 && <Button variant="ghost" size="sm" onClick={() => setAll(true)}>Show all {f.comments.length}</Button>}
        </ul>
      )}
    </Card>
  )
}

export default function TeacherDashboard() {
  const { user } = useSession()
  const { data, error, loading, reload } = useApi<Summary>('/api/teacher/summary')
  const sorted = data ? [...data.factors].sort((a, b) => b.average - a.average) : []
  const best = sorted[0], worst = sorted.length > 1 ? sorted[sorted.length - 1] : null

  return (
    <>
      <TopBar wide="md" title="Your feedback" right={<Button variant="ghost" size="sm" onClick={reload} aria-label="Refresh"><Icon name="refresh" size={16} /></Button>} />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand font-bold text-on-brand">{user ? initials(user.name) : ''}</span>
          <div><h1 className="font-display text-2xl font-semibold tracking-tight">{user?.name}</h1><p className="text-sm text-ink-3">Scores and comments are anonymous</p></div>
        </div>

        {error ? <EmptyState icon="alert" title="Could not load your feedback" action={<Button onClick={reload}>Try again</Button>}>{error}</EmptyState>
        : loading || !data ? <div className="space-y-3" aria-busy="true"><Skeleton className="h-44" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        : data.responses === 0 ? <EmptyState icon="chart" title="No feedback yet">Ratings will appear here as soon as students submit them.</EmptyState>
        : (
          <>
            <Card className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
              <div>
                <ScoreNumber value={data.overall} size="xl" />
                <p className="mt-2 font-semibold" style={{ color: textVar(data.overall ?? 1) }}>{ratingBand(data.overall ?? 1).label}</p>
                <p className="mt-0.5 text-sm text-ink-3">{plural(data.respondents, 'student')}, {plural(data.responses, 'rating')}</p>
              </div>
              <div><p className="mb-2 text-sm font-medium text-ink-2">How ratings are spread</p><Histogram counts={data.distribution} /></div>
            </Card>

            {best && worst && best.factor !== worst.factor && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Card className="p-4"><p className="text-[13px] text-ink-3">Strongest area</p><p className="mt-0.5 font-semibold">{best.factor}</p><ScoreNumber value={best.average} /></Card>
                <Card className="p-4"><p className="text-[13px] text-ink-3">Most room to grow</p><p className="mt-0.5 font-semibold">{worst.factor}</p><ScoreNumber value={worst.average} /></Card>
              </div>
            )}

            <h2 className="mb-3 mt-8 font-display text-lg font-semibold">By factor</h2>
            <div className="flex flex-col gap-3">{data.factors.map(f => <FactorCard key={f.factor} f={f} />)}</div>
          </>
        )}
      </main>
    </>
  )
}
