'use client'
import Link from 'next/link'
import { useState } from 'react'
import { academicDraftCount, useFeedback } from './FeedbackProvider'
import { Icon } from './Icon'
import { ConfirmDialog } from './ConfirmDialog'
import { StickyBar, TopBar } from './TopBar'
import { useToast } from './Toast'
import { Button, Card, LinkButton, Skeleton, initials } from './ui'
import { api } from '@/lib/api'
import { ACADEMIC_ITEMS, CATEGORY_META, FACTOR_HINTS, NON_ACADEMIC_CATEGORIES, TEACHER_FACTORS, TIMETABLE } from '@/lib/constants'
import { clearDrafts } from '@/lib/drafts'

export function RatingList({ kind }: { kind: 'academic' | 'non-academic' }) {
  const { user, sent, drafts, refresh } = useFeedback()
  const toast = useToast()
  const academic = kind === 'academic'
  const items = academic ? ACADEMIC_ITEMS : NON_ACADEMIC_CATEGORIES
  const sentSet = sent ? (academic ? sent.academic : sent.nonAcademic) : null
  const draftCount = (i: string) => (academic ? academicDraftCount(drafts, i) : drafts.nonAcademic[i]?.rating != null ? 1 : 0)

  const ready = items.filter(i => !sentSet?.has(i) && draftCount(i) > 0)
  const sentCount = sentSet?.size ?? 0
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const send = async () => {
    setBusy(true)
    try {
      const payload = academic
        ? { items: ready.map(item => ({ item, factors: Object.entries(drafts.academic[item]).filter(([, f]) => f.rating != null).map(([factor, f]) => ({ factor, rating: f.rating, comment: f.comment })) })) }
        : { items: ready.map(category => ({ category, rating: drafts.nonAcademic[category].rating, comment: drafts.nonAcademic[category].comment })) }
      await api(academic ? '/api/feedback/academic' : '/api/feedback/non-academic', payload)
      clearDrafts(user.id, academic ? 'academic' : 'nonAcademic', ready)
      refresh()
      setConfirming(false)
      setDone(true)
    } catch (e) {
      setConfirming(false)
      toast((e as Error).message, 'error')
    }
    setBusy(false)
  }

  const title = academic ? 'Teachers and timetable' : 'Campus life'
  const base = `/feedback/${kind}/rate?${academic ? 'name' : 'category'}=`

  if (done) {
    return (
      <>
        <TopBar />
        <main className="mx-auto grid max-w-md place-items-center px-4 pt-24 text-center" role="status">
          <span className="anim-pop mb-5 grid size-16 place-items-center rounded-full bg-brand-soft text-brand-text"><Icon name="check" size={30} strokeWidth={2.6} /></span>
          <h1 className="font-display text-2xl font-semibold">Feedback sent</h1>
          <p className="mt-2 text-ink-2">Thank you. Your ratings have been recorded and can no longer be changed.</p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <LinkButton href="/feedback" size="lg">Back to home</LinkButton>
            {sentSet && sentSet.size < items.length && <Button variant="secondary" size="lg" onClick={() => setDone(false)}>Rate something else</Button>}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar back={{ href: '/feedback', label: 'Home' }} title={title} progress={((sentCount + ready.length) / items.length) * 100} />
      <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{academic ? 'Who would you like to rate?' : 'What would you like to rate?'}</h1>
        <p className="mt-1 text-[15px] text-ink-2">Tap {academic ? 'a name' : 'a category'} to start. Every rating is optional.</p>

        <ul className="mt-5 flex flex-col gap-2.5">
          {items.map(item => {
            const isSent = !!sentSet?.has(item)
            const n = draftCount(item)
            const meta = academic ? null : CATEGORY_META[item]
            const total = academic ? (item === TIMETABLE ? 1 : TEACHER_FACTORS.length) : 1
            const inner = (
              <>
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${isSent ? 'bg-brand text-on-brand' : n ? 'bg-brand-soft text-brand-text' : 'bg-surface-2 text-ink-3'}`}>
                  {isSent ? <Icon name="check" size={20} strokeWidth={2.6} /> : academic ? (item === TIMETABLE ? <Icon name="calendar" size={20} /> : initials(item)) : <Icon name={meta?.icon ?? 'chart'} size={20} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{item}</span>
                  <span className="block truncate text-[13px] text-ink-3">
                    {isSent ? 'Sent' : n ? (total > 1 ? `Draft, ${n} of ${total} rated` : 'Draft saved') : academic ? (item === TIMETABLE ? FACTOR_HINTS['Overall Rating'] : `${total} factors to rate`) : meta?.hint}
                  </span>
                </span>
                {isSent ? null : n ? <Icon name="pencil" size={16} className="text-brand-text" /> : <Icon name="chevron-right" className="text-ink-3" />}
              </>
            )
            const cls = 'flex items-center gap-3.5 rounded-card border bg-surface p-3.5 transition-[border-color,transform]'
            return (
              <li key={item}>
                {sentSet == null ? <Skeleton className="h-[72px] rounded-card" />
                  : isSent ? <div className={`${cls} border-line opacity-75`}>{inner}</div>
                  : <Link href={base + encodeURIComponent(item)} className={`${cls} ${n ? 'border-brand-text/40' : 'border-line hover:border-line-strong'} active:scale-[.99]`}>{inner}</Link>}
              </li>
            )
          })}
        </ul>

        {sentSet && sentSet.size === items.length && (
          <Card className="mt-5 p-4 text-center text-sm text-ink-2">You have sent feedback for everything here. Thank you!</Card>
        )}
      </main>

      <StickyBar>
        <p className="min-w-0 flex-1 text-sm text-ink-2">{ready.length ? <><b className="text-ink">{ready.length}</b> ready to send</> : 'Nothing to send yet'}</p>
        <Button size="lg" disabled={!ready.length} onClick={() => setConfirming(true)}>Send feedback</Button>
      </StickyBar>

      <ConfirmDialog open={confirming} busy={busy} title={`Send ${ready.length} ${ready.length === 1 ? 'rating' : 'ratings'}?`}
        confirmLabel="Send feedback" onConfirm={send} onCancel={() => setConfirming(false)}>
        Once sent, they can&apos;t be changed. Anything you haven&apos;t rated stays open for later.
      </ConfirmDialog>
    </>
  )
}
