import { fillVar, fmt1, textVar } from '@/lib/rating'

export function ScoreBar({ value, className = '' }: { value: number | null; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-surface-2 ${className}`}>
      {value != null && <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${value * 10}%`, background: fillVar(value) }} />}
    </div>
  )
}

export function ScoreNumber({ value, size = 'md' }: { value: number | null; size?: 'md' | 'xl' }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 tabular-nums" style={{ color: value != null ? textVar(value) : undefined }}>
      <span className={`font-display font-bold ${size === 'xl' ? 'text-6xl leading-none' : 'text-xl'}`}>{fmt1(value)}</span>
      <span className="text-xs font-medium text-ink-3">/10</span>
    </span>
  )
}

export function Histogram({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts)
  return (
    <div role="img" aria-label={`Ratings 1 to 10: ${counts.join(', ')}`}>
      <div className="flex h-16 items-end gap-1">
        {counts.map((c, i) => (
          <div key={i} className="flex-1 rounded-t-[4px]" title={`${i + 1}: ${c}`}
            style={{ height: `${Math.max(c ? 8 : 3, (c / max) * 100)}%`, background: c ? fillVar(i + 1) : 'var(--surface-2)' }} />
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[11px] text-ink-3">{counts.map((_, i) => <span key={i} className="flex-1 text-center">{i + 1}</span>)}</div>
    </div>
  )
}
