import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PulseData - Real-time Crypto Dashboard',
  description: 'Real-time API Aggregator Dashboard for cryptocurrency data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
