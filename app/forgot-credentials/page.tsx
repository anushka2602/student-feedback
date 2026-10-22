'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { Icon } from '@/components/Icon'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button, Card, ErrorNote, Field, LinkButton } from '@/components/ui'
import { api } from '@/lib/api'
import { isRole, Role } from '@/lib/types'

function ForgotForm() {
  const params = useSearchParams()
  const role: Role = isRole(params.get('role')) ? (params.get('role') as Role) : 'student'
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await api<{ message: string }>('/api/auth/forgot', { email, role })
      setMessage(r.message)
    } catch (err) { setError((err as Error).message) }
    setBusy(false)
  }

  return (
    <main className="relative grid min-h-dvh place-items-center px-5 py-10">
      <ThemeToggle className="absolute right-4 top-4" />
      <Card className="w-full max-w-md p-6 shadow-card sm:p-8">
        {message ? (
          <div className="text-center" role="status">
            <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-brand-soft text-brand-text"><Icon name="mail" size={26} /></span>
            <h1 className="font-display text-2xl font-semibold">Check your email</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{message}</p>
            <p className="mt-2 text-sm text-ink-3">Sign in with the temporary password, then change it from the account menu.</p>
            <LinkButton href={`/login?role=${role}`} size="lg" full className="mt-6">Back to sign in</LinkButton>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
            <p className="mt-2 text-[15px] text-ink-2">Enter the email registered to your {role} account. We will send you a temporary password.</p>
            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <Field label="Registered email" htmlFor="email">
                <input id="email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" required />
              </Field>
              <ErrorNote>{error}</ErrorNote>
              <Button type="submit" size="lg" full loading={busy}>{busy ? 'Sending…' : 'Email me a temporary password'}</Button>
              <Link href={`/login?role=${role}`} className="text-center text-sm font-medium text-brand-text hover:underline">Back to sign in</Link>
            </form>
          </>
        )}
      </Card>
    </main>
  )
}

export default function ForgotCredentialsPage() {
  return <Suspense><ForgotForm /></Suspense>
}
