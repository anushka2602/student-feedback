'use client'
import { THEME_STORAGE_KEY } from '@/lib/theme'
import { Icon } from './Icon'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light') } catch { /* private mode */ }
  }
  return (
    <button type="button" onClick={toggle} aria-label="Switch between light and dark theme" title="Switch theme"
      className={`grid size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 ${className}`}>
      <Icon name="moon" className="dark:hidden" />
      <Icon name="sun" className="hidden dark:block" />
    </button>
  )
}
