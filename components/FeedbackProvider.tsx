'use client'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useApi } from '@/lib/api'
import { Drafts, useDrafts } from '@/lib/drafts'
import { SessionUser } from '@/lib/types'

interface Ctx {
  user: SessionUser
  drafts: Drafts
  /** null while loading */
  sent: { academic: Set<string>; nonAcademic: Set<string> } | null
  statusError?: string
  refresh: () => void
}
const FeedbackCtx = createContext<Ctx | null>(null)
export const useFeedback = () => {
  const c = useContext(FeedbackCtx)
  if (!c) throw new Error('useFeedback must be used inside FeedbackProvider')
  return c
}

export function FeedbackProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  const drafts = useDrafts(user.id)
  const { data, error, reload } = useApi<{ academic: string[]; nonAcademic: string[] }>('/api/feedback/status')
  const sent = useMemo(() => (data ? { academic: new Set(data.academic), nonAcademic: new Set(data.nonAcademic) } : null), [data])
  return <FeedbackCtx.Provider value={{ user, drafts, sent, statusError: error, refresh: reload }}>{children}</FeedbackCtx.Provider>
}

export const academicDraftCount = (d: Drafts, item: string) => Object.values(d.academic[item] ?? {}).filter(f => f.rating != null).length
