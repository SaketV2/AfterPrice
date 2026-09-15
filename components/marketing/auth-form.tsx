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

  return <div className={styles.authCard}>
    <Link href="/" className="inline-flex min-h-11 items-center" aria-label="AfterPrice home"><Wordmark /></Link>
    <h1>{title}</h1>
    <p className={styles.authCardDescription}>{description}</p>
    <form action={formAction} className={styles.authForm}>
      <input type="hidden" name="next" value={next} />
      <div className={styles.authFormFields}>
        {mode === 'signup' && <AuthField label="Name" name="name" autoComplete="name" placeholder="Your name" />}
        {mode !== 'reset' && <AuthField label="Email" name="email" type="email" autoComplete="email" placeholder="name@example.com" />}
        {(mode === 'login' || mode === 'signup' || mode === 'reset') && <AuthField label={mode === 'reset' ? 'New password' : 'Password'} name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" />}
        {state.error && <FormMessage>{state.error}</FormMessage>}
        {state.message && <p role="status" className={styles.formSuccess}>{state.message}</p>}
      </div>
      <button type="submit" disabled={pending} className={styles.authSubmit}>{pending ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Update password'} <ArrowUpRight aria-hidden="true" size={17} /></button>
    </form>
    {mode === 'login' && <p className={styles.authCenteredNote}><Link href="/forgot-password" className={styles.authLink}>Forgot password?</Link></p>}
    {(mode === 'login' || mode === 'signup') && <p className={[styles.authCenteredNote, styles.authMuted].join(' ')}>{mode === 'login' ? 'Need an account?' : 'Already have an account?'} <Link href={mode === 'login' ? '/signup' : '/login'} className={styles.authLink}>{mode === 'login' ? 'Sign up' : 'Log in'}</Link></p>}
    {mode === 'forgot' && <p className={styles.authCenteredNote}><Link href="/login" className={styles.authLink}>Back to login</Link></p>}
  </div>
}

function AuthField({ label, name, type = 'text', autoComplete, placeholder }: { label: string; name: string; type?: string; autoComplete: string; placeholder: string }) {
  return <label className={styles.authField}><span>{label}</span><input name={name} type={type} autoComplete={autoComplete} required className="outline-none" placeholder={placeholder} /></label>
}
