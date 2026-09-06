'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MonitorPreview } from './product-preview'

export function DemoLauncher() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  function enterDemo() { setLoading(true); window.setTimeout(() => router.push('/app'), 280) }
  return <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#6875f5]">No registration required</p><h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-750 leading-[.96] tracking-[-.07em] sm:text-7xl">See what SpendGuard catches.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#5d6673]">Step into a seeded account with realistic purchases, plan changes and upcoming renewals. Search it, filter it and see the decision path.</p><button type="button" onClick={enterDemo} disabled={loading} className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-[#0c0f14] px-6 text-sm font-semibold text-white transition hover:bg-[#2a2f37] disabled:cursor-wait disabled:opacity-60">{loading ? 'Opening your watchtower…' : 'Enter the interactive demo'} <span className="ml-2" aria-hidden="true">↗</span></button><p className="mt-5 max-w-sm text-xs leading-5 text-[#818b99]">Uses sample data only. No bank connection, retailer login or payment details required.</p></div><MonitorPreview /></div>
}
