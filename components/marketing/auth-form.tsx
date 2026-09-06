'use client'

/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormMessage, Wordmark } from './marketing-ui'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (mode === 'signup' && !name.trim()) { setError('Enter your name to continue.'); return }
    if (!email.includes('@')) { setError('Enter a valid-looking email address.'); return }
    if (password.length < 6) { setError('Use at least 6 characters for the demo password.'); return }
    setLoading(true)
    window.setTimeout(() => router.push('/app'), 300)
  }

  return <div className="w-full max-w-md rounded-[28px] border border-[#e1e5ea] bg-white p-7 shadow-[0_12px_36px_rgba(12,15,20,.08)] sm:p-9"><a href="/" className="inline-flex"><Wordmark /></a><p className="mt-10 text-[11px] font-bold uppercase tracking-[.16em] text-[#6875f5]">{mode === 'login' ? 'Welcome back' : 'Start watching'}</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-700 leading-tight tracking-[-.06em]">{mode === 'login' ? 'Open your watchtower.' : 'Make quiet cost changes visible.'}</h1><p className="mt-4 text-sm leading-6 text-[#5d6673]">{mode === 'login' ? 'Use any valid-looking details to enter the local demo.' : 'Create a demo account to explore SpendGuard with sample data.'}</p><form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>{mode === 'signup' && <label className="block"><span className="mb-2 block text-sm font-semibold text-[#3f4854]">Name</span><input value={name} onChange={event => setName(event.target.value)} autoComplete="name" className="min-h-12 w-full rounded-xl border border-[#d8dde5] bg-[#f6f6f3] px-4 text-sm text-[#0c0f14] outline-none transition placeholder:text-[#818b99] focus:border-[#6875f5] focus:ring-4 focus:ring-[#6875f5]/15" placeholder="Alex Morgan" /></label>}<label className="block"><span className="mb-2 block text-sm font-semibold text-[#3f4854]">Email</span><input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" className="min-h-12 w-full rounded-xl border border-[#d8dde5] bg-[#f6f6f3] px-4 text-sm text-[#0c0f14] outline-none transition placeholder:text-[#818b99] focus:border-[#6875f5] focus:ring-4 focus:ring-[#6875f5]/15" placeholder="name at domain" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-[#3f4854]">Password</span><input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="min-h-12 w-full rounded-xl border border-[#d8dde5] bg-[#f6f6f3] px-4 text-sm text-[#0c0f14] outline-none transition placeholder:text-[#818b99] focus:border-[#6875f5] focus:ring-4 focus:ring-[#6875f5]/15" placeholder="At least 6 characters" /></label>{error && <FormMessage>{error}</FormMessage>}<button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#0c0f14] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2f37] disabled:cursor-wait disabled:opacity-60">{loading ? 'Opening demo…' : mode === 'login' ? 'Log in to demo' : 'Create demo account'} <span className="ml-2" aria-hidden="true">↗</span></button></form><p className="mt-7 rounded-xl bg-[#f0f2f5] px-3 py-2.5 text-xs leading-5 text-[#5d6673]">Demo behaviour: no production authentication or payment is connected. Your details stay in this local flow.</p><p className="mt-6 text-center text-sm text-[#5d6673]">{mode === 'login' ? 'Need an account?' : 'Already have an account?'} <a href={mode === 'login' ? '/signup' : '/login'} className="font-semibold text-[#5967e8] hover:underline">{mode === 'login' ? 'Sign up' : 'Log in'}</a></p></div>
}
