import type { Metadata, Viewport } from 'next'
import './globals.css'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import { ThemeFab } from '@/app/components/ThemeFab'

export const metadata: Metadata = {
  title: 'Student Feedback System',
  description: 'Share your feedback to help us improve',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="page-shell min-h-screen overflow-x-hidden pb-20 sm:pb-6">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
        <ThemeFab />
      </body>
    </html>
  )
}
