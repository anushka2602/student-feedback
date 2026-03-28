import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Student Feedback System',
  description: 'Share your feedback to help us improve',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFF6F6]">{children}</body>
    </html>
  )
}