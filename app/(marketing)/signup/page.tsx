import { AuthForm } from '@/components/marketing/auth-form'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Sign up' }

export default async function SignupPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) redirect('/app')
  return <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8"><AuthForm mode="signup" /></main>
}
