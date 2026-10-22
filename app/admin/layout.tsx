'use client'
import { useRequireSession } from '@/components/SessionProvider'
import { Skeleton } from '@/components/ui'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useRequireSession('admin')
  if (!user) return <main className="mx-auto max-w-5xl space-y-3 p-5 pt-20" aria-busy="true"><Skeleton className="h-40" /><Skeleton className="h-24" /></main>
  return children
}
