'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import { Icon, LogoMark } from '@/components/Icon'
import { useSession } from '@/components/SessionProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button, ErrorNote, Field } from '@/components/ui'
import { homeFor, isRole, Role } from '@/lib/types'

const LABEL: Record<Role, string> = { student: 'Student', teacher: 'Teacher', admin: 'Admin' }
const QUOTE: Record<Role, string> = {
  student: 'Your honest feedback makes our institution better for everyone.',
  teacher: 'Growth starts with understanding how students experience your teaching.',
  admin: 'Good decisions start with honest feedback from students.',
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const role: Role = isRole(params.get('role')) ? (params.get('role') as Role) : 'student'
  const { user, signIn } = useSession()

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) router.replace(homeFor(user.role)) }, [user, router])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const u = await signIn(role, id.trim(), password)
      router.replace(homeFor(u.role))
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[5fr_6fr]">
      <section className="hidden flex-col justify-between bg-[#2c687b] p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5"><LogoMark size={36} /><span className="font-display text-lg font-semibold">Student Feedback</span></Link>
        <p className="max-w-md font-display text-3xl font-semibold leading-snug tracking-tight">{QUOTE[role]}</p>
        <p className="text-sm text-white/85">Signing in as {LABEL[role].toLowerCase()}</p>
      </section>

      <section className="relative flex items-center justify-center px-5 py-12">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-ink"><Icon name="arrow-left" size={16} />Back</Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>

          <div role="tablist" aria-label="Sign in as" className="mt-5 grid grid-cols-3 rounded-control bg-surface-2 p-1">
            {(Object.keys(LABEL) as Role[]).map(r => (
              <Link key={r} role="tab" aria-selected={r === role} href={`/login?role=${r}`} replace
                className={`rounded-lg py-2 text-center text-sm font-semibold transition-colors ${r === role ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'}`}>
                {LABEL[r]}
              </Link>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <Field label="Your ID" htmlFor="id">
              <input id="id" className="input" value={id} onChange={e => setId(e.target.value)} placeholder="e.g. STU001" autoComplete="username" spellCheck={false} autoCapitalize="none" required />
            </Field>
            <Field label="Password" htmlFor="pw">
              <div className="relative">
                <input id="pw" className="input pr-12" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" onClick={() => setShow(s => !s)} aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-ink-3 hover:text-ink">
                  <Icon name={show ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </Field>
            <ErrorNote>{error}</ErrorNote>
            <Button type="submit" size="lg" full loading={busy} className="mt-1">{busy ? 'Signing in…' : `Sign in as ${LABEL[role].toLowerCase()}`}</Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href={`/forgot-credentials?role=${role}`} className="font-medium text-brand-text hover:underline">Forgot your password?</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
