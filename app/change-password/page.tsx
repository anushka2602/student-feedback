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
    <div className="min-h-screen bg-[#FFF6F6] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-extrabold text-[#2C687B] mb-1">Change Password</h2>
        <p className="text-[#8CC7C4] text-sm mb-7">Update your account password</p>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-[#2C687B] font-semibold mb-6">Password updated successfully!</p>
            <button onClick={() => router.push(getBackPath())}
              className="bg-[#2C687B] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90">
              Go Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: 'Current Password', val: oldPass, set: setOldPass },
              { label: 'New Password', val: newPass, set: setNewPass },
              { label: 'Confirm New Password', val: confirm, set: setConfirm },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[#2C687B] font-semibold text-sm mb-2 block">{field.label}</label>
                <input
                  type="password"
                  value={field.val}
                  onChange={e => field.set(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8CC7C4] text-[#2C687B] font-medium"
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-[#DB1A1A] text-sm font-medium">❌ {error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="py-4 rounded-xl bg-[#DB1A1A] text-white font-bold mt-2 hover:opacity-90 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <button type="button" onClick={() => router.push(getBackPath())}
              className="text-center text-[#8CC7C4] text-sm hover:text-[#2C687B]">
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}