import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover shadow-sm',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2',
  danger: 'bg-accent text-white hover:brightness-95',
}
const SIZE = { sm: 'min-h-9 px-3 text-sm', md: 'min-h-11 px-4 text-[15px]', lg: 'min-h-12 px-5 text-base' }

export const buttonClass = (variant: Variant = 'primary', size: keyof typeof SIZE = 'md', full = false) =>
  `inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold transition-[background-color,transform,opacity] active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 ${VARIANT[variant]} ${SIZE[size]} ${full ? 'w-full' : ''}`

export function Spinner({ size = 16 }: { size?: number }) {
  return <span className="inline-block animate-spin rounded-full border-2 border-current border-r-transparent" style={{ width: size, height: size }} aria-hidden />
}

export function Button({ variant, size, full, loading, children, disabled, className = '', ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZE; full?: boolean; loading?: boolean }) {
  return (
    <button {...rest} disabled={disabled || loading} className={`${buttonClass(variant, size, full)} ${className}`}>
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function LinkButton({ href, variant, size, full, children, className = '' }:
  { href: string; variant?: Variant; size?: keyof typeof SIZE; full?: boolean; children: ReactNode; className?: string }) {
  return <Link href={href} className={`${buttonClass(variant, size, full)} ${className}`}>{children}</Link>
}

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[13px] text-ink-3">{hint}</p>}
      {error && <p className="mt-1.5 text-[13px] font-medium text-accent-text">{error}</p>}
    </div>
  )
}

export function ErrorNote({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <div role="alert" className="anim-fade flex items-start gap-2.5 rounded-control border border-accent/30 bg-accent-soft px-3.5 py-3 text-sm font-medium text-accent-text">
      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-card border border-line bg-surface ${className}`}>{children}</div>
)

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />
}

export function EmptyState({ icon, title, children, action }: { icon: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-surface-2 text-ink-3"><Icon name={icon} size={22} /></span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {children && <p className="mt-1 max-w-sm text-sm text-ink-3">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-surface-2 ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${value}%` }} />
    </div>
  )
}

export function initials(name: string) {
  const w = name.split(/\s+/).filter(x => /^[A-Z]/.test(x) && !/^(Er|Ms|Mr|Dr|Mrs)\.?$/.test(x))
  return (w.length ? w : name.split(/\s+/)).map(x => x[0]).join('').slice(0, 2).toUpperCase() || '?'
}
