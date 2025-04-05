'use client'
import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

interface SessionWrapperProps {
  children: ReactNode
}

export default function SessionWrapper({ children }: SessionWrapperProps): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>
}
