'use client'
import { useRequireSession } from '@/components/SessionProvider'
import { Skeleton } from '@/components/ui'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = useRequireSession('teacher')
  if (!user) return <main className="mx-auto max-w-3xl space-y-3 p-5 pt-20" aria-busy="true"><Skeleton className="h-40" /><Skeleton className="h-24" /></main>
  return children
}
