'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ForgotForm() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'student'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('Credentials sent! Check your inbox (and spam folder).')
      } else {
        setStatus('error')
        setMessage(data.error || 'No account found with that email address.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-5 sm:p-6">
      <div className="surface w-full max-w-md rounded-3xl p-6 fade-in sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">Forgot credentials?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Enter your registered email and we&apos;ll send your ID and password.
        </p>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-3xl dark:bg-teal-950/50">✉️</div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Email sent</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
            <Link
              href={`/login?role=${role}`}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2C687B] py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-opacity hover:opacity-95"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Registered email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@email.com"
                required
                className="input-field"
              />
            </div>

            {status === 'error' && (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/40">
                <p className="text-sm font-medium text-[#DB1A1A]">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="min-h-12 rounded-xl bg-[#2C687B] py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send my credentials'}
            </button>

            <Link href={`/login?role=${role}`} className="text-center text-sm font-medium text-[#2C687B] hover:underline dark:text-teal-300">
              ← Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ForgotCredentialsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="animate-pulse-soft text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      }
    >
      <ForgotForm />
    </Suspense>
  )
}