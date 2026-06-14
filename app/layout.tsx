import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'ResuMatch — AI Job Evaluation',
  description: 'Free AI-powered job evaluation. Paste a job description, get an A–F grade, and track every application.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
