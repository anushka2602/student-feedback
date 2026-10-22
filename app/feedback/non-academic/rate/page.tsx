'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useFeedback } from '@/components/FeedbackProvider'
import { Icon } from '@/components/Icon'
import { RateForm } from '@/components/RateForm'
import { TopBar } from '@/components/TopBar'
import { EmptyState, LinkButton, Skeleton } from '@/components/ui'
import { CATEGORY_META, NON_ACADEMIC_CATEGORIES } from '@/lib/constants'
import { saveNonAcademicDraft } from '@/lib/drafts'

function Rate() {
  const category = useSearchParams().get('category') ?? ''
  const { user, sent, drafts } = useFeedback()
  const back = '/feedback/non-academic'

  if (!NON_ACADEMIC_CATEGORIES.includes(category)) {
    return <><TopBar back={{ href: back, label: 'List' }} /><main className="mx-auto max-w-2xl p-4 pt-10"><EmptyState icon="search" title="We couldn't find that" action={<LinkButton href={back}>Back to the list</LinkButton>}>That category isn&apos;t on the list.</EmptyState></main></>
  }
  if (!sent) return <><TopBar back={{ href: back, label: 'List' }} /><main className="mx-auto max-w-2xl space-y-3 p-4"><Skeleton className="h-16" /><Skeleton className="h-48" /></main></>
  if (sent.nonAcademic.has(category)) {
    return <><TopBar back={{ href: back, label: 'List' }} /><main className="mx-auto max-w-2xl p-4 pt-10"><EmptyState icon="check" title="Already sent" action={<LinkButton href={back}>Back to the list</LinkButton>}>You have already submitted feedback for this category. It can&apos;t be changed.</EmptyState></main></>
  }

  const meta = CATEGORY_META[category]
  const next = NON_ACADEMIC_CATEGORIES.slice(NON_ACADEMIC_CATEGORIES.indexOf(category) + 1).find(c => !sent.nonAcademic.has(c))
  const d = drafts.nonAcademic[category]
  return (
    <RateForm key={category} title={category} subtitle={meta?.hint} avatar={<Icon name={meta?.icon ?? 'chart'} size={26} />}
      factors={[{ key: 'rating', label: 'Your rating' }]}
      initial={d ? { rating: d } : {}} onChange={v => saveNonAcademicDraft(user.id, category, v.rating ?? { rating: null, comment: '' })}
      backHref={back} nextHref={next ? `/feedback/non-academic/rate?category=${encodeURIComponent(next)}` : null} nextLabel="Next category" />
  )
}

export default function Page() { return <Suspense><Rate /></Suspense> }
