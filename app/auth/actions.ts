'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { safeAppPath } from '@/lib/auth/redirects'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string }
const credentials = z.object({ email: z.string().email(), password: z.string().min(8).max(128) })

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: 'Enter a valid email and a password of at least 8 characters.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Those details were not accepted. Check your email and password.' }
  revalidatePath('/', 'layout')
  redirect(safeAppPath(formData.get('next')))
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.extend({ name: z.string().trim().min(1).max(80) }).safeParse({ email: formData.get('email'), password: formData.get('password'), name: formData.get('name') })
  if (!parsed.success) return { error: 'Enter your name, a valid email and a password of at least 8 characters.' }
  const supabase = await createClient()
  const next = safeAppPath(formData.get('next'))
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { data: { display_name: parsed.data.name }, emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` } })
  if (error) return { error: error.message }
  if (!data.session) return { message: 'Check your email to confirm your account, then log in.' }
  revalidatePath('/', 'layout')
  redirect(next)
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
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
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
