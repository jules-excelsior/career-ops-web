import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Career Ops — AI Job Search System',
  description: 'Evaluate job offers with AI and track your pipeline. By Excelsior Consultancy Services.',
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
