'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { safeAppPath } from '@/lib/auth/redirects'
import { publicSignupError } from '@/lib/auth/messages'
import { CHECKOUT_SESSION_ID_PATTERN, CLAIM_TOKEN_PATTERN } from '@/lib/billing/validation'
import { getPublicSiteOrigin } from '@/lib/http/site-origin'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string }
const credentials = z.object({ email: z.string().email(), password: z.string().min(8).max(128) })
const checkoutSessionId = z.string().regex(CHECKOUT_SESSION_ID_PATTERN)
const checkoutClaimToken = z.string().regex(CLAIM_TOKEN_PATTERN)

function getCheckoutClaim(formData: FormData) {
  const sessionId = checkoutSessionId.safeParse(formData.get('checkout_session_id'))
  const claimToken = checkoutClaimToken.safeParse(formData.get('checkout_claim_token'))
  return sessionId.success && claimToken.success ? { sessionId: sessionId.data, claimToken: claimToken.data } : null
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: 'Enter a valid email and a password of at least 8 characters.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Those details were not accepted. Check your email and password.' }
  revalidatePath('/', 'layout')
  const claim = getCheckoutClaim(formData)
  redirect(claim ? `/app?checkout=claim&session_id=${encodeURIComponent(claim.sessionId)}&claim_token=${encodeURIComponent(claim.claimToken)}` : safeAppPath(formData.get('next')))
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.extend({ name: z.string().trim().min(1).max(80) }).safeParse({ email: formData.get('email'), password: formData.get('password'), name: formData.get('name') })
  if (!parsed.success) return { error: 'Enter your name, a valid email and a password of at least 8 characters.' }
  const supabase = await createClient()
  const next = safeAppPath(formData.get('next'))
  const claim = getCheckoutClaim(formData)
  const signupNext = claim ? `/app?checkout=claim&session_id=${encodeURIComponent(claim.sessionId)}&claim_token=${encodeURIComponent(claim.claimToken)}` : next
  const origin = getPublicSiteOrigin()
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { data: { display_name: parsed.data.name }, emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(signupNext)}` } })
  if (error) {
    console.error('[auth.signup] Supabase signup failed.', error)
    return { error: publicSignupError(error) }
  }
  if (!data.session) return { message: claim ? 'Payment is recorded. Check your email to confirm your account, then return here to finish setup.' : 'Check your email to confirm your account, then log in.' }
  revalidatePath('/', 'layout')
  redirect(signupNext)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = z.string().email().safeParse(formData.get('email'))
  if (!email.success) return { error: 'Enter the email address for your account.' }
  const origin = getPublicSiteOrigin()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${origin}/auth/callback?next=/reset-password` })
  return error ? { error: 'The reset email could not be sent. Try again.' } : { message: 'If that account exists, a password reset link is on its way.' }
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = z.string().min(8).max(128).safeParse(formData.get('password'))
  if (!password.success) return { error: 'Use a password of at least 8 characters.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: password.data })
  if (error) return { error: 'Your password could not be updated. Request a new reset link.' }
  redirect('/app/settings?password=updated')
}
