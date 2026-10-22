'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useFeedback } from '@/components/FeedbackProvider'
import { RateForm } from '@/components/RateForm'
import { TopBar } from '@/components/TopBar'
import { EmptyState, LinkButton, Skeleton, initials } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { ACADEMIC_ITEMS, FACTOR_HINTS, factorsFor, TIMETABLE } from '@/lib/constants'
import { saveAcademicDraft } from '@/lib/drafts'

function Rate() {
  const name = useSearchParams().get('name') ?? ''
  const { user, sent, drafts } = useFeedback()
  const back = '/feedback/academic'

  if (!ACADEMIC_ITEMS.includes(name)) {
    return <><TopBar back={{ href: back, label: 'List' }} /><main className="mx-auto max-w-2xl p-4 pt-10"><EmptyState icon="search" title="We couldn't find that" action={<LinkButton href={back}>Back to the list</LinkButton>}>That teacher isn&apos;t on the list.</EmptyState></main></>
  }
  if (!sent) return <><TopBar back={{ href: back, label: 'List' }} /><main className="mx-auto max-w-2xl space-y-3 p-4"><Skeleton className="h-16" /><Skeleton className="h-48" /></main></>
  if (sent.academic.has(name)) {
    return <><TopBar back={{ href: back, label: 'List' }} /><main className="mx-auto max-w-2xl p-4 pt-10"><EmptyState icon="check" title="Already sent" action={<LinkButton href={back}>Back to the list</LinkButton>}>You have already submitted feedback for {name}. It can&apos;t be changed.</EmptyState></main></>
  }

  const idx = ACADEMIC_ITEMS.indexOf(name)
  const next = ACADEMIC_ITEMS.slice(idx + 1).find(i => !sent.academic.has(i))
  const factors = factorsFor(name)
  return (
    <RateForm key={name} title={name} subtitle={name === TIMETABLE ? 'One overall rating' : `Rate any of the ${factors.length} factors`}
      avatar={name === TIMETABLE ? <Icon name="calendar" size={26} /> : initials(name)}
      factors={factors.map(f => ({ key: f, label: f, hint: FACTOR_HINTS[f] }))}
      initial={drafts.academic[name] ?? {}} onChange={v => saveAcademicDraft(user.id, name, v)}
      backHref={back} nextHref={next ? `/feedback/academic/rate?name=${encodeURIComponent(next)}` : null} nextLabel="Next teacher" />
  )
}

export default function Page() { return <Suspense><Rate /></Suspense> }
