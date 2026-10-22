'use client'
import { Button } from '@/components/ui'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mb-6 mt-1 text-ink-3">It&apos;s not you. Try again, and if it keeps happening let your administrator know.</p>
        <Button size="lg" onClick={reset}>Try again</Button>
      </div>
    </main>
  )
}
