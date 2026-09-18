'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import { CHECKOUT_SESSION_ID_PATTERN, CLAIM_TOKEN_PATTERN } from '@/lib/billing/validation'

type ClaimState = 'idle' | 'working' | 'success' | 'error'

export function CheckoutClaim() {
  const params = useSearchParams()
  const router = useRouter()
  const sessionId = params.get('session_id')
  const claimToken = params.get('claim_token')
  const shouldClaim = params.get('checkout') === 'claim' && CHECKOUT_SESSION_ID_PATTERN.test(sessionId ?? '') && CLAIM_TOKEN_PATTERN.test(claimToken ?? '')
  const [state, setState] = useState<ClaimState>(shouldClaim ? 'working' : 'idle')
  const [message, setMessage] = useState('Confirming your Pro access…')

  useEffect(() => {
    if (!shouldClaim || !sessionId || !claimToken) return
    let cancelled = false

    async function claim(attempt = 0): Promise<void> {
      try {
        const response = await fetch('/api/billing/claim', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, claimToken }),
        })
        const result = await response.json() as { claimed?: boolean; error?: string }
        if (result.claimed) {
          if (!cancelled) {
            setState('success')
            setMessage('Pro access is ready.')
            window.setTimeout(() => router.replace('/app'), 1200)
          }
          return
        }
        if (attempt < 4 && !cancelled) {
          setMessage('Payment received. Waiting for the secure account update…')
          window.setTimeout(() => void claim(attempt + 1), 2000)
          return
        }
        if (!cancelled) {
          setState('error')
          setMessage(result.error ?? 'We could not finish linking this checkout. Keep this page open and try again shortly.')
        }
      } catch {
        if (attempt < 4 && !cancelled) {
          window.setTimeout(() => void claim(attempt + 1), 2000)
          return
        }
        if (!cancelled) {
          setState('error')
          setMessage('We could not reach AfterPrice to finish linking this checkout.')
        }
      }
    }

    void claim()
    return () => { cancelled = true }
  }, [claimToken, router, sessionId, shouldClaim])

  if (!shouldClaim) return null
  return <p role={state === 'error' ? 'alert' : 'status'} className={`mb-6 flex items-center gap-2 rounded-input border px-4 py-3 text-sm font-semibold ${state === 'error' ? 'border-[hsl(var(--danger)/.35)] bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger))]' : 'border-[hsl(var(--success)/.35)] bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]'}`}>{state === 'success' ? <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> : state === 'error' ? <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> : <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}{message}</p>
}
