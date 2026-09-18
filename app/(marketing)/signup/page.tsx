import { AuthForm } from '@/components/marketing/auth-form'
import type { CheckoutClaim } from '@/components/marketing/auth-form'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PENDING_CHECKOUT_COOKIE } from '@/lib/billing/claims'
import { CHECKOUT_SESSION_ID_PATTERN, CLAIM_TOKEN_PATTERN } from '@/lib/billing/validation'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Sign up' }

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ checkout?: string; session_id?: string }> }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) redirect('/app')
  const params = await searchParams
  const claimToken = (await cookies()).get(PENDING_CHECKOUT_COOKIE)?.value
  const checkoutClaim: CheckoutClaim | undefined = params.checkout === 'success' && CHECKOUT_SESSION_ID_PATTERN.test(params.session_id ?? '') && CLAIM_TOKEN_PATTERN.test(claimToken ?? '') ? { sessionId: params.session_id!, claimToken: claimToken! } : undefined
  return <main id="main-content" tabIndex={-1} className={[styles.authFrame, 'flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8'].join(' ')}><AuthForm mode="signup" checkoutClaim={checkoutClaim} /></main>
}
