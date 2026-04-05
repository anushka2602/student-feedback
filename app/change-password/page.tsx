'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, setUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const getBackPath = () => {
    const user = getUser()
    if (!user) return '/'
    if (user.role === 'teacher') return '/teacher'
    if (user.role === 'admin') return '/admin'
    return '/feedback'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = getUser()
    if (!user) { router.push('/'); return }

    if (newPass !== confirm) { setError('New passwords do not match.'); return }
    if (newPass.length < 4) { setError('Password must be at least 4 characters.'); return }

    setLoading(true)

    // Verify old password
    const { data: check } = await supabase
      .from('users').select('id').eq('id', user.id).eq('password', oldPass).single()

    if (!check) { setError('Current password is incorrect.'); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('users').update({ password: newPass }).eq('id', user.id)

    if (updateError) { setError('Update failed. Please try again.'); setLoading(false); return }

    // Update local storage
    setUser({ ...user, password: newPass })
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-5 sm:p-6">
      <div className="surface w-full max-w-md rounded-3xl p-6 fade-in sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Change password</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Update your account password securely.</p>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl dark:bg-teal-950/50">✅</div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Password updated successfully</p>
            <button
              type="button"
              onClick={() => router.push(getBackPath())}
              className="mt-8 min-h-12 w-full rounded-xl bg-[#2C687B] py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-opacity hover:opacity-95"
            >
              Go back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            {[
              { label: 'Current password', val: oldPass, set: setOldPass },
              { label: 'New password', val: newPass, set: setNewPass },
              { label: 'Confirm new password', val: confirm, set: setConfirm },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{field.label}</label>
                <input
                  type="password"
                  value={field.val}
                  onChange={(e) => field.set(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            ))}

            {error ? (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/40">
                <p className="text-sm font-medium text-[#DB1A1A]">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 min-h-12 rounded-xl bg-[#DB1A1A] py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-900/25 transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
            <button
              type="button"
              onClick={() => router.push(getBackPath())}
              className="text-center text-sm font-medium text-[#2C687B] hover:underline dark:text-teal-300"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}