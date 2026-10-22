'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { homeFor } from '@/lib/types'
import { Icon, LogoMark } from './Icon'
import { useSession } from './SessionProvider'
import { ThemeToggle } from './ThemeToggle'
import { initials } from './ui'

function UserMenu() {
  const { user, signOut } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key) }
  }, [open])

  if (!user) return null
  const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-surface-2'
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2">
        <span className="grid size-8 place-items-center rounded-full bg-brand text-xs font-bold text-on-brand">{initials(user.name)}</span>
        <Icon name="chevron-down" size={14} className={`text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="anim-fade absolute right-0 top-full z-40 mt-2 w-64 rounded-card border border-line bg-surface p-1.5 shadow-card">
          <div className="border-b border-line px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-[13px] capitalize text-ink-3">{user.role} · {user.display_id}</p>
          </div>
          <div className="pt-1.5">
            <Link role="menuitem" href="/change-password" className={item} onClick={() => setOpen(false)}><Icon name="key" size={16} className="text-ink-3" />Change password</Link>
            <button role="menuitem" className={item} onClick={async () => { setOpen(false); await signOut(); router.replace('/') }}>
              <Icon name="logout" size={16} className="text-ink-3" />Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TopBar({ title, back, wide, right, progress }: {
  title?: string; back?: { href: string; label: string }; wide?: boolean | 'md'; right?: ReactNode; progress?: number
}) {
  const { user } = useSession()
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className={`mx-auto flex h-14 items-center gap-2 px-3 sm:px-5 ${wide === 'md' ? 'max-w-3xl' : wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {back ? (
          <Link href={back.href} className="-ml-1 flex min-h-10 items-center gap-1.5 rounded-full pl-2 pr-3 text-sm font-medium text-ink-2 hover:bg-surface-2">
            <Icon name="arrow-left" size={17} />{back.label}
          </Link>
        ) : (
          <Link href={user ? homeFor(user.role) : '/'} className="flex items-center gap-2.5 rounded-lg pr-2">
            <LogoMark size={30} />
            <span className="font-display text-[17px] font-semibold tracking-tight">Feedback</span>
          </Link>
        )}
        {title && <h1 className="ml-1 truncate text-[15px] font-semibold text-ink-2 max-sm:hidden">{title}</h1>}
        <div className="ml-auto flex items-center gap-1">
          {right}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      {progress != null && (
        <div className="h-[3px] bg-surface-2"><div className="h-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} /></div>
      )}
    </header>
  )
}

export function StickyBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">{children}</div>
    </div>
  )
}
