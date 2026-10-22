'use client'
import { ReactNode, useEffect, useRef } from 'react'
import { Button } from './ui'

export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = 'Keep editing', busy, onConfirm, onCancel }: {
  open: boolean; title: string; children?: ReactNode; confirmLabel: string; cancelLabel?: string; busy?: boolean
  onConfirm: () => void; onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog ref={ref} className="sheet" onCancel={e => { e.preventDefault(); if (!busy) onCancel() }}
      onClick={e => { if (e.target === ref.current && !busy) onCancel() }} aria-labelledby="confirm-title">
      <div className="w-full rounded-t-[20px] border border-line bg-surface p-6 text-ink shadow-xl sm:w-[26rem] sm:rounded-card">
        <h2 id="confirm-title" className="font-display text-xl font-semibold">{title}</h2>
        {children && <div className="mt-2 text-[15px] leading-relaxed text-ink-2">{children}</div>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  )
}
