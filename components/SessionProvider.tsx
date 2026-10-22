'use client'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { homeFor, Role, SessionUser } from '@/lib/types'

interface Ctx {
  user: SessionUser | null
  status: 'loading' | 'authed' | 'anon'
  signIn: (role: Role, displayId: string, password: string) => Promise<SessionUser>
  signOut: () => Promise<void>
}
const SessionCtx = createContext<Ctx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: SessionUser | null; ready: boolean }>({ user: null, ready: false })

  useEffect(() => {
    let live = true
    api<{ user: SessionUser | null }>('/api/auth/me')
      .then(r => live && setState({ user: r.user, ready: true }))
      .catch(() => live && setState({ user: null, ready: true }))
    return () => { live = false }
  }, [])

  const signIn = useCallback<Ctx['signIn']>(async (role, display_id, password) => {
    const { user } = await api<{ user: SessionUser }>('/api/auth/login', { role, display_id, password })
    setState({ user, ready: true })
    return user
  }, [])

  const signOut = useCallback(async () => {
    await api('/api/auth/logout', {}).catch(() => {})
    setState({ user: null, ready: true })
  }, [])

  const status = !state.ready ? 'loading' : state.user ? 'authed' : 'anon'
  return <SessionCtx.Provider value={{ user: state.user, status, signIn, signOut }}>{children}</SessionCtx.Provider>
}

export function useSession() {
  const c = useContext(SessionCtx)
  if (!c) throw new Error('useSession must be used inside SessionProvider')
  return c
}

/** Redirects away unless signed in (optionally as a specific role). Returns the user once ready. */
export function useRequireSession(role?: Role): SessionUser | null {
  const { user, status } = useSession()
  const router = useRouter()
  const wrongRole = !!user && !!role && user.role !== role
  useEffect(() => {
    if (status === 'anon') router.replace(role ? `/login?role=${role}` : '/')
    else if (wrongRole && user) router.replace(homeFor(user.role))
  }, [status, wrongRole, user, role, router])
  return status === 'authed' && !wrongRole ? user : null
}
