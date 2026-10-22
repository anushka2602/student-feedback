'use client'
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { Icon } from './Icon'

type Kind = 'success' | 'error' | 'info'
interface T { id: number; msg: string; kind: Kind }
const Ctx = createContext<(msg: string, kind?: Kind) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([])
  const nextId = useRef(1)
  const push = useCallback((msg: string, kind: Kind = 'success') => {
    const id = nextId.current++
    setItems(i => [...i.slice(-2), { id, msg, kind }])
    setTimeout(() => setItems(i => i.filter(t => t.id !== id)), kind === 'error' ? 6000 : 3500)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[100] flex flex-col items-center gap-2 px-4">
        {items.map(t => (
          <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'}
            className="anim-toast pointer-events-auto flex max-w-md items-center gap-2.5 rounded-control bg-ink px-4 py-3 text-sm font-medium text-app shadow-lg">
            <Icon name={t.kind === 'error' ? 'alert' : t.kind === 'info' ? 'info' : 'check'} size={16} className="shrink-0" />
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
