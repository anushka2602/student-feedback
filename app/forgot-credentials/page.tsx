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
    <div className="min-h-screen bg-[#FFF6F6] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-[#2C687B] mb-1">Forgot Credentials?</h2>
        <p className="text-[#8CC7C4] text-sm mb-7">
          Enter your registered email and we&apos;ll send your ID and password
        </p>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-5">✉️</div>
            <p className="text-[#2C687B] font-semibold text-lg mb-2">Email Sent!</p>
            <p className="text-[#8CC7C4] text-sm mb-8">{message}</p>
            <Link
              href={`/login?role=${role}`}
              className="inline-block bg-[#2C687B] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[#2C687B] font-semibold text-sm mb-2 block">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="yourname@email.com"
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8CC7C4] text-[#2C687B] font-medium transition-colors"
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-[#DB1A1A] text-sm font-medium">❌ {message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="py-4 rounded-xl bg-[#2C687B] text-white font-bold text-base hover:opacity-90 active:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {status === 'loading' ? 'Sending...' : 'Send My Credentials'}
            </button>

            <Link
              href={`/login?role=${role}`}
              className="text-center text-[#8CC7C4] text-sm hover:text-[#2C687B] transition-colors"
            >
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ForgotCredentialsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF6F6] flex items-center justify-center"><p className="text-[#2C687B]">Loading...</p></div>}>
      <ForgotForm />
    </Suspense>
  )
}