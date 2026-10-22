import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import './globals.css'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import { SessionProvider } from '@/components/SessionProvider'
import { ToastProvider } from '@/components/Toast'

const body = Figtree({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display-face', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Student Feedback', template: '%s · Student Feedback' },
  description: 'Rate your teachers and campus in a few taps.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f6f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1317' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
