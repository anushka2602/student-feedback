'use client'
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { COMMENT_MAX } from '@/lib/config'
import { FactorDraft } from '@/lib/drafts'
import { RatingInput } from './RatingInput'
import { Icon } from './Icon'
import { StickyBar, TopBar } from './TopBar'
import { Card, LinkButton } from './ui'

export interface FactorDef { key: string; label: string; hint?: string }

/** Edits ratings for one item. Every change is autosaved as a draft, so nothing is lost by leaving. */
export function RateForm({ title, subtitle, avatar, factors, initial, onChange, backHref, nextHref, nextLabel }: {
  title: string; subtitle?: string; avatar: ReactNode; factors: FactorDef[]
  initial: Record<string, FactorDraft>; onChange: (v: Record<string, FactorDraft>) => void
  backHref: string; nextHref?: string | null; nextLabel?: string
}) {
  const [values, setValues] = useState<Record<string, FactorDraft>>(initial)
  const update = (key: string, patch: Partial<FactorDraft>) => {
    const next = { ...values, [key]: { rating: values[key]?.rating ?? null, comment: values[key]?.comment ?? '', ...patch } }
    setValues(next)
    onChange(next)
  }
  const rated = factors.filter(f => values[f.key]?.rating != null).length

  return (
    <>
      <TopBar back={{ href: backHref, label: 'List' }} progress={(rated / factors.length) * 100} />
      <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6">
        <div className="mb-6 flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-bold text-on-brand">{avatar}</span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
            <p className="text-sm text-ink-3">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {factors.map(f => {
            const v = values[f.key]
            return (
              <Card key={f.key} className="p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{f.label}</h2>
                    {f.hint && <p className="text-[13px] text-ink-3">{f.hint}</p>}
                  </div>
                  {v?.rating != null && (
                    <button type="button" onClick={() => update(f.key, { rating: null, comment: '' })} className="shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium text-ink-3 hover:bg-surface-2 hover:text-ink">Clear</button>
                  )}
                </div>
                <RatingInput value={v?.rating ?? null} onChange={r => update(f.key, { rating: r })} label={f.label} />
                {v?.rating != null && (
                  <div className="anim-fade mt-4">
                    <label htmlFor={`c-${f.key}`} className="sr-only">Comment on {f.label}</label>
                    <textarea id={`c-${f.key}`} className="input min-h-[76px] resize-y text-[15px]" rows={2} maxLength={COMMENT_MAX}
                      placeholder="Add a comment (optional)" value={v.comment} onChange={e => update(f.key, { comment: e.target.value })} />
                    {v.comment.length > COMMENT_MAX - 100 && <p className="mt-1 text-right text-xs text-ink-3">{v.comment.length}/{COMMENT_MAX}</p>}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </main>

      <StickyBar>
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-ink-2">
          {rated > 0 ? <><Icon name="check" size={15} className="text-brand-text" /> Saved</> : 'Pick a number to begin'}
        </p>
        <Link href={backHref} className={`inline-flex min-h-12 items-center rounded-control px-4 font-semibold ${nextHref ? 'text-ink-2 hover:bg-surface-2' : 'bg-brand text-on-brand hover:bg-brand-hover'}`}>Done</Link>
        {nextHref && <LinkButton href={nextHref} size="lg">{nextLabel ?? 'Next'}</LinkButton>}
      </StickyBar>
    </>
  )
}
