'use client'
import { KeyboardEvent, useRef } from 'react'
import { fillVar, ratingBand, textVar } from '@/lib/rating'

/** 1–10 tap scale. Selected value is solid; lower values are tinted so it reads like a meter. */
export function RatingInput({ value, onChange, label, compact }: {
  value: number | null; onChange: (v: number) => void; label: string; compact?: boolean
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const band = value ? ratingBand(value) : null

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = Math.min(9, Math.max(0, i + d))
    refs.current[n]?.focus()
    onChange(n + 1)
  }

  return (
    <div>
      <div className="mb-2.5 flex h-6 items-baseline justify-between text-sm">
        <span className="text-ink-3">{value ? '' : 'Tap a number from 1 to 10'}</span>
        {band && value && (
          <span key={band.label} className="anim-fade font-semibold" style={{ color: textVar(value) }}>
            <span className="font-display text-xl">{value}</span><span className="text-ink-3">/10</span> {band.label}
          </span>
        )}
      </div>
      <div role="radiogroup" aria-label={label} className={`grid gap-1.5 ${compact ? 'grid-cols-10' : 'grid-cols-5 sm:grid-cols-10'}`}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const selected = n === value
          const within = value != null && n < value
          return (
            <button key={n} type="button" role="radio" aria-checked={selected} aria-label={`${n} – ${ratingBand(n).label}`}
              ref={el => { refs.current[n - 1] = el }}
              tabIndex={selected || (value == null && n === 1) ? 0 : -1}
              onClick={() => onChange(n)} onKeyDown={e => onKey(e, n - 1)}
              className={`${compact ? 'h-9 text-sm' : 'h-12 text-base'} rounded-control border font-semibold tabular-nums transition-[background-color,color,transform,border-color] duration-150 active:scale-95 ${selected ? 'anim-pop border-transparent text-white' : 'border-line text-ink-2 hover:border-line-strong'} ${!selected && !within ? 'bg-surface-2' : ''}`}
              style={selected ? { background: fillVar(n) } : within ? { background: `color-mix(in srgb, ${fillVar(value!)} 16%, var(--surface))`, borderColor: `color-mix(in srgb, ${fillVar(value!)} 35%, var(--line))` } : undefined}>
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-3"><span>Poor</span><span>Excellent</span></div>
    </div>
  )
}
