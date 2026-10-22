'use client'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Icon } from '@/components/Icon'
import { useRequireSession } from '@/components/SessionProvider'
import { useToast } from '@/components/Toast'
import { TopBar } from '@/components/TopBar'
import { Button, Card, ErrorNote, Field, Skeleton } from '@/components/ui'
import { api } from '@/lib/api'
import { homeFor } from '@/lib/types'

export default function ChangePasswordPage() {
  const user = useRequireSession()
  const router = useRouter()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!user) return <main className="mx-auto max-w-md p-6"><Skeleton className="h-72" /></main>
  const home = homeFor(user.role)
  const tooShort = next.length > 0 && next.length < 8
  const mismatch = confirm.length > 0 && confirm !== next

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next !== confirm) { setError('The new passwords do not match.'); return }
    setBusy(true); setError('')
    try {
      await api('/api/auth/change-password', { current, next })
      toast('Password updated')
      router.replace(home)
    } catch (err) { setError((err as Error).message); setBusy(false) }
  }

  const type = show ? 'text' : 'password'
  return (
    <>
      <TopBar back={{ href: home, label: 'Back' }} />
      <main className="mx-auto w-full max-w-md px-4 py-8">
        <Card className="p-6 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-semibold">Change password</h1>
          <p className="mt-1 text-[15px] text-ink-2">Use at least 8 characters.</p>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <Field label="Current password" htmlFor="cur"><input id="cur" className="input" type={type} value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" required /></Field>
            <Field label="New password" htmlFor="new" error={tooShort ? 'Needs at least 8 characters.' : undefined}>
              <input id="new" className="input" type={type} value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" aria-invalid={tooShort} required />
            </Field>
            <Field label="Confirm new password" htmlFor="conf" error={mismatch ? 'Does not match the new password.' : undefined}>
              <input id="conf" className="input" type={type} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" aria-invalid={mismatch} required />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} className="size-4 accent-[var(--brand)]" /><Icon name={show ? 'eye' : 'eye-off'} size={15} />Show passwords</label>
            <ErrorNote>{error}</ErrorNote>
            <Button type="submit" size="lg" full loading={busy} disabled={tooShort || mismatch}>Save new password</Button>
          </form>
        </Card>
      </main>
    </>
  )
}
