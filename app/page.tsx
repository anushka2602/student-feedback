'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon, LogoMark } from '@/components/Icon'
import { RatingInput } from '@/components/RatingInput'
import { useSession } from '@/components/SessionProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { academicYear } from '@/lib/config'
import { homeFor, Role } from '@/lib/types'

const ROLES: { role: Role; label: string; desc: string; icon: string }[] = [
  { role: 'student', label: 'Student', desc: 'Rate your teachers and campus', icon: 'cap' },
  { role: 'teacher', label: 'Teacher', desc: 'See your ratings and comments', icon: 'layout' },
  { role: 'admin', label: 'Admin', desc: 'Review all feedback and trends', icon: 'shield' },
]

export default function Home() {
  const router = useRouter()
  const { user, status } = useSession()
  const [demo, setDemo] = useState<number | null>(null)

  useEffect(() => { if (user) router.replace(homeFor(user.role)) }, [user, router])

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[5fr_6fr]">
      <section className="flex flex-col gap-10 bg-[#2c687b] px-6 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] text-white lg:justify-between lg:px-14 lg:py-12">
        <div className="flex items-center gap-2.5">
          <LogoMark size={36} />
          <span className="font-display text-lg font-semibold">Student Feedback</span>
          <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-[13px] font-medium">{academicYear()}</span>
          <ThemeToggle className="-mr-2 text-white hover:bg-white/15 lg:hidden" />
        </div>

        <div className="max-w-lg">
          <h1 className="font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-5xl">Rate your classes in a few taps.</h1>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/85">
            Pick a number, add a comment if you want to. Teachers see scores and comments, never who wrote them.
          </p>
        </div>

        <div className="max-w-lg rounded-card bg-surface p-5 text-ink shadow-xl max-lg:hidden">
          <p className="mb-1 font-semibold">Try it</p>
          <p className="mb-4 text-sm text-ink-3">How clear was your last lecture? (This is a demo; nothing is saved.)</p>
          <RatingInput value={demo} onChange={setDemo} label="Demo rating" compact />
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 lg:px-14">
        <ThemeToggle className="absolute right-4 top-4 max-lg:hidden" />
        <div className="w-full max-w-sm">
          {status === 'authed' ? (
            <p className="text-center text-ink-3" role="status">Taking you to your dashboard…</p>
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold">Sign in as</h2>
              <p className="mb-6 mt-1 text-[15px] text-ink-3">Use the ID and password your institution gave you.</p>
              <ul className="flex flex-col gap-3">
                {ROLES.map(r => (
                  <li key={r.role}>
                    <Link href={`/login?role=${r.role}`}
                      className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] hover:border-brand-text/50 hover:shadow-card active:scale-[.99]">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text"><Icon name={r.icon} size={22} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{r.label}</span>
                        <span className="block text-sm text-ink-3">{r.desc}</span>
                      </span>
                      <Icon name="chevron-right" className="text-ink-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
