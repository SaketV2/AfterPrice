import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { ProductShell } from '@/components/dashboard/product-ui'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import { ThemePreferenceSync, isTheme } from '@/lib/theme'

export const dynamic = 'force-dynamic'

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const { supabase, claims, userId } = await getAuthenticatedContext()
  if (!claims || !userId) redirect('/login')
  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
    supabase.from('user_preferences').select('theme').eq('user_id', userId).maybeSingle(),
  ])
  const email = typeof claims.email === 'string' ? claims.email : 'Account'
  const name = profile?.display_name?.trim() || email.split('@')[0] || 'Account'
  return <ProductShell user={{ name, email }}><ThemePreferenceSync theme={isTheme(preferences?.theme) ? preferences.theme : 'system'} />{children}</ProductShell>
}
