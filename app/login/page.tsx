'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setUser } from '@/lib/auth'
import Link from 'next/link'

const roleConfig = {
  student: { color: '#DB1A1A', label: 'Student', gradient: 'from-[#0f3d4d] via-[#1a5568] to-[#2C687B]' },
  teacher: { color: '#2C687B', label: 'Teacher', gradient: 'from-[#0c3544] via-[#164a5c] to-[#1a4a5a]' },
  admin: { color: '#334155', label: 'Admin', gradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]' },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') || 'student') as 'student' | 'teacher' | 'admin'
  const config = roleConfig[role]

  const [displayId, setDisplayId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('display_id', displayId.trim())
      .eq('password', password)
      .eq('role', role)
      .single()

    if (dbError || !data) {
      setError('Incorrect ID or password. Please try again.')
      setLoading(false)
      return
    }

    setUser(data)
    if (role === 'teacher') router.push('/teacher')
    else if (role === 'admin') router.push('/admin')
    else router.push('/feedback')
  }

  const quote =
    role === 'student'
      ? 'Your honest feedback makes our institution better for everyone.'
      : role === 'teacher'
        ? 'Growth starts with understanding how your students experience your teaching.'
        : 'Data-driven decisions begin with honest student feedback.'

  return (
    <div className="fade-in flex min-h-screen flex-col bg-white lg:flex-row dark:bg-slate-950">
      <div
        className={`relative hidden w-full flex-col justify-between overflow-hidden px-10 py-10 md:flex md:w-[42%] md:min-h-screen md:shrink-0 md:px-10 md:py-12 bg-gradient-to-br ${config.gradient} text-white`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DB1A1A] shadow-md shadow-black/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/95">Feedback Portal</span>
        </div>

        <div className="relative">
          <div className="mb-4 font-serif text-5xl leading-none text-white/15">&ldquo;</div>
          <p className="font-display text-xl font-semibold leading-snug text-white sm:text-[1.35rem]">{quote}</p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white backdrop-blur-sm">
              {role === 'student' ? 'S' : role === 'teacher' ? 'T' : 'A'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{config.label} Login</div>
              <div className="text-xs text-white/50">Secure &amp; Anonymous</div>
            </div>
          </div>
        </div>

        <div className="relative flex gap-2">
          {(['student', 'teacher', 'admin'] as const).map((r) => (
            <div
              key={r}
              className={`h-1 flex-1 rounded-full ${r === role ? 'bg-white' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 sm:py-12">
        <div className="w-full max-w-[380px]">
          <Link
            href="/"
            className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to roles
          </Link>

          <div className="mb-8">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
              style={{ backgroundColor: config.color }}
            >
              {config.label}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Enter your assigned credentials below</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Your ID</label>
              <input
                type="text"
                value={displayId}
                onChange={(e) => setDisplayId(e.target.value)}
                placeholder="e.g. STU001"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="input-field pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 flex min-h-11 -translate-y-1/2 items-center px-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-sm font-medium text-[#DB1A1A]">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 min-h-12 w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-[transform,opacity,box-shadow] hover:opacity-[0.97] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              style={{
                backgroundColor: loading ? '#94a3b8' : config.color,
                boxShadow: loading ? undefined : `0 12px 32px -8px ${config.color}55`,
              }}
            >
              {loading ? 'Signing in...' : `Sign in as ${config.label}`}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-slate-200/80 pt-8 dark:border-slate-700/80">
            <Link href={`/forgot-credentials?role=${role}`} className="text-sm font-semibold text-[#2C687B] hover:underline dark:text-teal-300">
              Forgot your credentials?
            </Link>
            <Link href="/change-password" className="text-sm text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              Change password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
          <p className="animate-pulse-soft text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
