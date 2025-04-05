import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.scss'
import { Providers } from './providers'

import Script from 'next/script'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chart Analysis',
  description: 'Data visualization and analysis tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://kit.fontawesome.com/c4e248e73c.js" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>

      </body>
    </html>
  )
}
