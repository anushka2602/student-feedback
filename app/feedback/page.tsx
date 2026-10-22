'use client'
import Link from 'next/link'
import { academicDraftCount, useFeedback } from '@/components/FeedbackProvider'
import { Icon } from '@/components/Icon'
import { TopBar } from '@/components/TopBar'
import { Card, ProgressBar, Skeleton } from '@/components/ui'
import { ANONYMOUS_MODE } from '@/lib/config'
import { ACADEMIC_ITEMS, NON_ACADEMIC_CATEGORIES } from '@/lib/constants'

function Category({ href, icon, title, desc, total, sent, drafted }: { href: string; icon: string; title: string; desc: string; total: number; sent: number | null; drafted: number }) {
  const done = sent === total
  return (
    <Link href={href} className="group block rounded-card border border-line bg-surface p-5 transition-[border-color,box-shadow,transform] hover:border-brand-text/50 hover:shadow-card active:scale-[.99]">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text"><Icon name={icon} size={24} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-3">{desc}</p>
        </div>
        <Icon name="chevron-right" className="mt-3 text-ink-3 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4">
        {sent == null ? <Skeleton className="h-4 w-full" /> : (
          <>
            <ProgressBar value={((sent + (done ? 0 : Math.min(drafted, total - sent))) / total) * 100} />
            <p className="mt-2 text-[13px] text-ink-3">
              {done ? 'All sent. Thank you!' : `${sent} of ${total} sent${drafted ? `, ${drafted} ready to send` : ''}`}
            </p>
          </>
        )}
      </div>
    </Link>
  )
}

export default function FeedbackHome() {
  const { user, sent, drafts, statusError } = useFeedback()
  const academicDrafted = ACADEMIC_ITEMS.filter(i => academicDraftCount(drafts, i) > 0 && !sent?.academic.has(i)).length
  const nonDrafted = NON_ACADEMIC_CATEGORIES.filter(c => drafts.nonAcademic[c]?.rating != null && !sent?.nonAcademic.has(c)).length

  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-[15px] text-ink-2">Choose what you would like to rate. You can do it in more than one sitting.</p>

        {statusError && <p role="alert" className="mt-4 rounded-control bg-accent-soft px-4 py-3 text-sm text-accent-text">We could not check what you have already sent: {statusError}</p>}

        <div className="mt-6 flex flex-col gap-4">
          <Category href="/feedback/academic" icon="cap" title="Teachers and timetable" desc="Eight factors per teacher, plus the timetable"
            total={ACADEMIC_ITEMS.length} sent={sent?.academic.size ?? null} drafted={academicDrafted} />
          <Category href="/feedback/non-academic" icon="building" title="Campus life" desc="Facilities, safety, Wi-Fi, food and more"
            total={NON_ACADEMIC_CATEGORIES.length} sent={sent?.nonAcademic.size ?? null} drafted={nonDrafted} />
        </div>

        <Card className="mt-6 flex gap-3 p-4 text-sm leading-relaxed text-ink-2">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-brand-text" />
          <p>
            Rate only what you want to. Your answers are saved on this device as you go, and nothing is sent until you press Send.{' '}
            {ANONYMOUS_MODE ? 'Your name is not stored with your answers.' : 'Teachers never see who wrote a comment. Administrators can see who submitted.'}
          </p>
        </Card>
      </main>
    </>
  )
}
