import { AuthForm } from '@/components/marketing/auth-form'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Sign up' }

export default async function SignupPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) redirect('/app')
  return <main id="main-content" tabIndex={-1} className={[styles.authFrame, 'flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8'].join(' ')}><AuthForm mode="signup" /></main>
}
