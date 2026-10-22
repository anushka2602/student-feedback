import { LinkButton } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-6xl font-bold text-brand-text">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">This page doesn&apos;t exist</h1>
        <p className="mb-6 mt-1 text-ink-3">The link may be old or mistyped.</p>
        <LinkButton href="/" size="lg">Go to home</LinkButton>
      </div>
    </main>
  )
}
