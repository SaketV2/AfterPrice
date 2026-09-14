import type { Metadata } from 'next'
import { MarketingFooter, MarketingHeader, MarketingShell } from '@/components/marketing/marketing-shell'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: { default: 'Stop losing money after you buy', template: '%s | AfterPrice' },
  description: 'AfterPrice keeps a record of what you paid, shows what changed and gives you the evidence and timing to decide what to do next.',
  applicationName: 'AfterPrice',
  openGraph: { title: 'AfterPrice | Stop losing money after you buy', description: 'Keep a record of price drops, plan changes and more expensive renewals after you buy.', type: 'website' },
}

export default async function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return <MarketingShell><MarketingHeader authenticated={Boolean(data?.claims)} />{children}<MarketingFooter /></MarketingShell>
}
