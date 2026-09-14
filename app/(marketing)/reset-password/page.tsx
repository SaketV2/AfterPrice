import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/marketing/auth-form'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Reset password' }
export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/forgot-password')
  return <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8"><AuthForm mode="reset" /></main>
}
