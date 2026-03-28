'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser } from '@/lib/auth'
import Link from 'next/link'

export default function FeedbackPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'student') { router.push('/'); return }
    setUserName(user.name)
  }, [router])

  const categories = [
    {
      key: 'academic',
      label: 'Academic',
      desc: 'Rate teachers and timetable',
      icon: '🎓',
      color: '#DB1A1A',
    },
    {
      key: 'non-academic',
      label: 'Non-Academic',
      desc: 'Rate infrastructure, facilities & more',
      icon: '🏫',
      color: '#2C687B',
    },
  ]

  return (
    <div className="min-h-screen bg-[#FFF6F6] p-6">
      {/* Navbar */}
      <div className="max-w-md mx-auto flex justify-between items-center mb-10 pt-2">
        <div>
          <p className="text-[#8CC7C4] text-xs font-semibold uppercase tracking-widest">Welcome</p>
          <p className="text-[#2C687B] font-bold text-lg">{userName}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/change-password"
            className="text-xs text-[#2C687B] border-2 border-[#2C687B] px-3 py-2 rounded-xl font-semibold hover:bg-[#2C687B] hover:text-white transition-colors">
            Change Password
          </Link>
          <button
            onClick={() => { clearUser(); router.push('/') }}
            className="text-xs text-[#DB1A1A] border-2 border-[#DB1A1A] px-3 py-2 rounded-xl font-semibold hover:bg-[#DB1A1A] hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#2C687B]">Submit Feedback</h2>
          <p className="text-[#8CC7C4] mt-1">What would you like to rate today?</p>
        </div>

        <div className="flex flex-col gap-5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => router.push(`/feedback/${cat.key}`)}
              className="group flex items-center gap-5 py-6 px-6 rounded-2xl text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              style={{ background: cat.color }}
            >
              <span className="text-4xl">{cat.icon}</span>
              <div className="text-left">
                <p className="font-extrabold text-xl">{cat.label}</p>
                <p className="text-white/75 text-sm mt-0.5">{cat.desc}</p>
              </div>
              <span className="ml-auto text-white/60 text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}