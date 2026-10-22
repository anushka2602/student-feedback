'use client'
import { FeedbackProvider } from '@/components/FeedbackProvider'
import { useRequireSession } from '@/components/SessionProvider'
import { Skeleton } from '@/components/ui'

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  const user = useRequireSession('student')
  if (!user) {
    return <main className="mx-auto max-w-2xl space-y-3 p-5 pt-20" aria-busy="true"><Skeleton className="h-8 w-48" /><Skeleton className="h-32" /><Skeleton className="h-32" /></main>
  }
  return <FeedbackProvider user={user}>{children}</FeedbackProvider>
}
