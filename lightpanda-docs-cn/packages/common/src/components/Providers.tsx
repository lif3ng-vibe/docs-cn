'use client'

// Stub of @lightpanda/common/components/Providers — plausible analytics provider,
// mirroring the live site (the docs domain reports to plausible.io).
import PlausibleProvider from 'next-plausible'
import type { ReactNode } from 'react'

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <PlausibleProvider domain="lightpanda.io" selfHosted={false} trackOutboundLinks>
      {children}
    </PlausibleProvider>
  )
}
