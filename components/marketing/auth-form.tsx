'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { login, requestPasswordReset, signup, updatePassword, type AuthState } from '@/app/auth/actions'
import { FormMessage, Wordmark } from './marketing-ui'
import styles from './marketing.module.css'

type Mode = 'login' | 'signup' | 'forgot' | 'reset'
const initialState: AuthState = {}

export function AuthForm({ mode, next = '/app' }: { mode: Mode; next?: string }) {
  const action = mode === 'login' ? login : mode === 'signup' ? signup : mode === 'forgot' ? requestPasswordReset : updatePassword
  const [state, formAction, pending] = useActionState(action, initialState)
  const title = { login: 'Open your change ledger.', signup: 'Make the change visible.', forgot: 'Reset your password.', reset: 'Choose a new password.' }[mode]
  const description = { login: 'Sign in to view your saved baselines and current comparisons.', signup: 'Create your AfterPrice account. Your baselines stay private to you.', forgot: 'We’ll send a secure reset link if the address belongs to an account.', reset: 'Use at least 8 characters for your new password.' }[mode]
  return (
    <div className={[styles.authCard, 'w-full max-w-md p-6 sm:p-9'].join(' ')}>
      <Link href="/" className="inline-flex min-h-11 items-center" aria-label="AfterPrice home"><Wordmark /></Link>
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">{title}</h1>
      <p className="mt-4 text-sm leading-6 text-[#5d6673]">{description}</p>
      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        {mode === 'signup' && <AuthField label="Name" name="name" autoComplete="name" placeholder="Your name" />}
        {mode !== 'reset' && <AuthField label="Email" name="email" type="email" autoComplete="email" placeholder="name@example.com" />}
        {(mode === 'login' || mode === 'signup' || mode === 'reset') && <AuthField label={mode === 'reset' ? 'New password' : 'Password'} name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" />}
        {state.error && <FormMessage>{state.error}</FormMessage>}
        {state.message && <p role="status" className="rounded-[12px] bg-[#e3f3e9] px-4 py-3 text-sm font-semibold leading-6 text-[#20744f]">{state.message}</p>}
        <button type="submit" disabled={pending} className="flex min-h-12 w-full items-center justify-center rounded-[12px] bg-[#0c0f14] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2f37] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6875f5]/25 disabled:cursor-wait disabled:opacity-60">
          {pending ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Update password'} <ArrowUpRight aria-hidden="true" size={17} className="ml-2" />
        </button>
      </form>
      {mode === 'login' && <p className="mt-4 text-center text-sm"><Link href="/forgot-password" className="font-semibold text-[#3258d4] underline-offset-4 hover:underline">Forgot password?</Link></p>}
      {(mode === 'login' || mode === 'signup') && <p className="mt-5 text-center text-sm text-[#5d6673]">{mode === 'login' ? 'Need an account?' : 'Already have an account?'} <Link href={mode === 'login' ? '/signup' : '/login'} className="font-semibold text-[#3258d4] underline-offset-4 hover:underline">{mode === 'login' ? 'Sign up' : 'Log in'}</Link></p>}
      {mode === 'forgot' && <p className="mt-5 text-center text-sm"><Link href="/login" className="font-semibold text-[#3258d4] underline-offset-4 hover:underline">Back to login</Link></p>}
    </div>
  )
}

function AuthField({ label, name, type = 'text', autoComplete, placeholder }: { label: string; name: string; type?: string; autoComplete: string; placeholder: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-[#3f4854]">{label}</span><input name={name} type={type} autoComplete={autoComplete} required className="min-h-12 w-full rounded-[12px] border border-[#cfd5dd] bg-[#f6f6f3] px-4 text-sm text-[#0c0f14] outline-none transition placeholder:text-[#68717e] focus:border-[#6875f5] focus:ring-4 focus:ring-[#6875f5]/15" placeholder={placeholder} /></label>
}
