import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline - LogosAI',
  description: 'You are currently offline. Some features may be limited.',
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
