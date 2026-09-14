import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { ProductShell } from '@/components/dashboard/product-ui'
import { getAuthenticatedContext } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const { supabase, claims, userId } = await getAuthenticatedContext()
  if (!claims || !userId) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
  const email = typeof claims.email === 'string' ? claims.email : 'Account'
  const name = profile?.display_name?.trim() || email.split('@')[0] || 'Account'
  return <ProductShell user={{ name, email }}>{children}</ProductShell>
}
