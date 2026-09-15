import { AuthForm } from '@/components/marketing/auth-form'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeAppPath } from '@/lib/auth/redirects'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Log in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const next = safeAppPath((await searchParams).next)
  if (data?.claims) redirect(next)
  return <main id="main-content" tabIndex={-1} className={[styles.authFrame, 'flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8'].join(' ')}><AuthForm mode="login" next={next} /></main>
}
