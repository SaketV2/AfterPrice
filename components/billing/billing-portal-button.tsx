'use client'

import { useState } from 'react'
import { ArrowUpRight, CreditCard } from 'lucide-react'

export function BillingPortalButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function openPortal() {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST', headers: { 'content-type': 'application/json' } })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error ?? 'Billing management could not be opened.')
      window.location.assign(result.url)
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Billing management could not be opened.')
      setPending(false)
    }
  }

  return <div>
    <button type="button" onClick={() => void openPortal()} disabled={pending} className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent-hover))] disabled:cursor-wait disabled:opacity-60"><CreditCard className="h-4 w-4" aria-hidden="true" />{pending ? 'Opening billing…' : 'Manage billing'}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button>
    {error && <p role="alert" className="mt-3 rounded-input bg-[hsl(var(--danger-soft))] px-3 py-2 text-xs font-semibold leading-5 text-[hsl(var(--danger))]">{error}</p>}
  </div>
}
