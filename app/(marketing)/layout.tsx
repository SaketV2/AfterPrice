import type { Metadata } from 'next'
import { MarketingFooter, MarketingHeader, MarketingShell } from '@/components/marketing/marketing-shell'

export const metadata: Metadata = {
  title: { default: 'SpendGuard | Stop losing money after you buy', template: '%s | SpendGuard' },
  description: 'SpendGuard watches your purchases, subscriptions and renewals so you can catch price drops, plan changes and costly renewals.',
  openGraph: { title: 'SpendGuard | Stop losing money after you buy', description: 'A personal money watchdog for the costs that quietly change after you buy.', type: 'website' },
}

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MarketingShell><MarketingHeader />{children}<MarketingFooter /></MarketingShell>
}
