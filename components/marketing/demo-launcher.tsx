import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { MonitorPreview } from './product-preview'

export function DemoLauncher() {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      <div>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">See what AfterPrice catches.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#5d6673]">Use the public example to understand the workflow, then sign in to track your own purchases and subscriptions. Your account starts with no user-owned records.</p>
        <Link href="/login?next=/app" className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0c0f14] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2f37] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6875f5]/25 sm:w-auto">
          Sign in to open AfterPrice <ArrowUpRight aria-hidden="true" size={17} className="ml-2" />
        </Link>
        <p className="mt-5 max-w-sm text-xs leading-5 text-[#68717e]">The visual example is illustrative. No bank connection or retailer login is required.</p>
      </div>
      <MonitorPreview />
    </div>
  )
}
