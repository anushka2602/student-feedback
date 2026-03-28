'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setUser } from '@/lib/auth'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') || 'student') as 'student' | 'teacher' | 'admin'

  const [displayId, setDisplayId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const roleConfig = {
    student: { color: '#DB1A1A', label: 'Student', icon: '🎓' },
    teacher: { color: '#2C687B', label: 'Teacher', icon: '📚' },
    admin: { color: '#8CC7C4', label: 'Admin', icon: '⚙️' },
  }

  const config = roleConfig[role]

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

  return (
    <div className="min-h-screen bg-[#FFF6F6] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-white text-sm font-bold px-4 py-2 rounded-full mb-4"
            style={{ background: config.color }}
          >
            <span>{config.icon}</span>
            <span>{config.label} Login</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#2C687B]">Welcome back</h2>
          <p className="text-[#8CC7C4] text-sm mt-1">Enter your assigned credentials</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-[#2C687B] font-semibold text-sm mb-2 block">Your ID</label>
            <input
              type="text"
              value={displayId}
              onChange={e => setDisplayId(e.target.value)}
              placeholder="e.g. STU001"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8CC7C4] text-[#2C687B] font-medium transition-colors"
            />
          </div>

          <div>
            <label className="text-[#2C687B] font-semibold text-sm mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8CC7C4] text-[#2C687B] font-medium transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2C687B] text-sm"
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-[#DB1A1A] text-sm font-medium">❌ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-4 rounded-xl text-white font-bold text-base mt-1 transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            style={{ background: config.color }}
          >
            {loading ? 'Logging in...' : `Login as ${config.label}`}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href={`/forgot-credentials?role=${role}`}
            className="text-[#2C687B] text-sm font-medium underline underline-offset-2 hover:text-[#DB1A1A] transition-colors"
          >
            🔑 Forgot your credentials?
          </Link>
          <Link href="/" className="text-[#8CC7C4] text-sm hover:text-[#2C687B] transition-colors">
            ← Back to role selection
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF6F6] flex items-center justify-center">
        <p className="text-[#2C687B]">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}