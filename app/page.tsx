'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user) {
      if (user.role === 'teacher') router.push('/teacher')
      else if (user.role === 'admin') router.push('/admin')
      else router.push('/feedback')
    }
  }, [router])

  const handleRole = (role: string) => {
    router.push(`/login?role=${role}`)
  }

  const roles = [
    { key: 'student', label: '🎓 Student Login', color: '#DB1A1A' },
    { key: 'teacher', label: '📚 Teacher Login', color: '#2C687B' },
    { key: 'admin', label: '⚙️ Admin Login', color: '#8CC7C4' },
  ]

  return (
    <div className="min-h-screen bg-[#FFF6F6] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block bg-[#DB1A1A] text-white text-xs font-bold px-4 py-1 rounded-full mb-4 tracking-widest uppercase">
          Feedback Portal
        </div>
        <h1 className="text-5xl font-extrabold text-[#2C687B] leading-tight mb-3">
          Student Feedback<br />System
        </h1>
        <p className="text-[#8CC7C4] text-base font-medium">
          Your voice shapes a better institution
        </p>
      </div>

      {/* Role Cards */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => handleRole(role.key)}
            className="group relative py-5 px-8 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] overflow-hidden"
            style={{ background: role.color }}
          >
            <span className="relative z-10">{role.label}</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          </button>
        ))}
      </div>

      <p className="text-[#8CC7C4] text-xs mt-10 text-center">
        Use your assigned ID and password to login
      </p>
    </div>
  )
}