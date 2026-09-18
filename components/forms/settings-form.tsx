'use client'

import { useActionState, useState } from 'react'
import { Bell, Check, CircleAlert, CircleCheck, CreditCard, Database, Eye, LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { updatePreferences, type AfterPriceActionState } from '@/features/afterprice/actions'
import type { UserPreferences } from '@/features/afterprice/types'
import { useTheme, type Theme } from '@/lib/theme'
import { PageIntro, Panel, StatusBadge } from '@/components/dashboard/product-ui'
import { BillingPortalButton } from '@/components/billing/billing-portal-button'

type NotificationPreferences = {
  priceDrops: boolean
  planChanges: boolean
  renewalWarnings: boolean
  weeklySummary: boolean
}

const initialState: AfterPriceActionState = {}
const inputClass = 'mt-2 h-12 w-full rounded-input border border-border bg-[hsl(var(--surface-subtle))] px-3.5 text-sm text-[hsl(var(--foreground-secondary))] outline-none'

function Toggle({ name, label, description, checked, onChange }: { name: string; label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  const descriptionId = `${name}-description`

  return (
    <label htmlFor={name} className="flex cursor-pointer items-center justify-between gap-5 rounded-input border border-border p-4 transition-colors hover:bg-[hsl(var(--surface-subtle))]">
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span id={descriptionId} className="mt-1 block text-xs leading-5 text-[hsl(var(--foreground-secondary))]">{description}</span>
      </span>
      <span className="relative h-7 w-12 shrink-0">
        <input id={name} type="checkbox" role="switch" name={name} checked={checked} onChange={event => onChange(event.target.checked)} aria-describedby={descriptionId} className="peer sr-only" />
        <span aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-[hsl(var(--border-strong))]'} peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2`} />
        <span aria-hidden="true" className={`pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-[hsl(var(--surface))] shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </label>
  )
}

export function SettingsForm({ email, displayName, purchaseCount, subscriptionCount, alertCount, preferences }: { email: string; displayName: string; purchaseCount: number; subscriptionCount: number; alertCount: number; preferences: UserPreferences | null }) {
  const { theme, setTheme } = useTheme()
  const [state, formAction, pending] = useActionState(updatePreferences, initialState)
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => ({
    priceDrops: preferences?.notify_price_drops ?? true,
    planChanges: preferences?.notify_plan_changes ?? true,
    renewalWarnings: preferences?.notify_renewals ?? true,
    weeklySummary: preferences?.notify_weekly_summary ?? true,
  }))

  function savePreferences(next: NotificationPreferences, nextTheme = theme) {
    setNotificationPreferences(next)
    const formData = new FormData()
    formData.set('theme', nextTheme)
    formData.set('notify_price_drops', String(next.priceDrops))
    formData.set('notify_plan_changes', String(next.planChanges))
    formData.set('notify_renewals', String(next.renewalWarnings))
    formData.set('notify_weekly_summary', String(next.weeklySummary))
    formAction(formData)
  }

  function chooseTheme(nextTheme: Theme) {
    setTheme(nextTheme)
    savePreferences(notificationPreferences, nextTheme)
  }

  const notice = state.message ?? (pending ? 'Saving your preferences…' : '')

  return <>
    <PageIntro title="Settings" description="Update your notifications and choose how AfterPrice looks on this device." action={notice ? <span aria-live="polite"><StatusBadge tone={state.error ? 'danger' : 'success'}>{state.error ? <CircleAlert className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}{notice}</StatusBadge></span> : undefined} />
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="min-w-0 space-y-6">
        <Panel>
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div><h3 className="font-display text-xl font-extrabold">Profile</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">The account details you use with AfterPrice.</p></div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label htmlFor="displayName" className="text-sm font-bold">Display name<input id="displayName" value={displayName} readOnly aria-readonly="true" className={inputClass} /></label>
            <label htmlFor="accountEmail" className="text-sm font-bold">Email<input id="accountEmail" value={email} readOnly aria-readonly="true" className={inputClass} /></label>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div><h3 className="font-display text-xl font-extrabold">Notifications</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Choose which changes AfterPrice should flag for you.</p></div>
          </div>
          <div className="mt-6 space-y-3">
            <Toggle name="notify_price_drops" label="Price drops" description="Let me know when a saved purchase is listed for less." checked={notificationPreferences.priceDrops} onChange={value => savePreferences({ ...notificationPreferences, priceDrops: value })} />
            <Toggle name="notify_plan_changes" label="Plan changes" description="Let me know when a saved subscription's price or plan details change." checked={notificationPreferences.planChanges} onChange={value => savePreferences({ ...notificationPreferences, planChanges: value })} />
            <Toggle name="notify_renewals" label="Renewal reminders" description="Remind me before a saved subscription renews." checked={notificationPreferences.renewalWarnings} onChange={value => savePreferences({ ...notificationPreferences, renewalWarnings: value })} />
            <Toggle name="notify_weekly_summary" label="Weekly roundup" description="Send a weekly summary of non-urgent activity." checked={notificationPreferences.weeklySummary} onChange={value => savePreferences({ ...notificationPreferences, weeklySummary: value })} />
          </div>
          {state.error && <p role="alert" className="mt-4 rounded-input bg-[hsl(var(--danger-soft))] px-4 py-3 text-sm font-semibold text-[hsl(var(--danger))]">{state.error}</p>}
        </Panel>
      </div>
      <div className="min-w-0 space-y-6">
        <Panel>
          <div className="flex items-start gap-3">
            <Eye className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div><h3 className="font-display text-xl font-extrabold">Appearance</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Choose the colour theme that feels right on this device.</p></div>
          </div>
          <div role="group" aria-label="Appearance theme" className="mt-6 space-y-2">
            <ThemeOption value="light" current={theme} label="Light" description="Warm paper and bright panels" onSelect={chooseTheme} />
            <ThemeOption value="dark" current={theme} label="Dark" description="Graphite surfaces with softer contrast" onSelect={chooseTheme} />
            <ThemeOption value="system" current={theme} label="System" description="Follow your device's setting" onSelect={chooseTheme} />
          </div>
        </Panel>
        <Panel>
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div><h3 className="font-display text-xl font-extrabold">Your saved records</h3><p className="mt-1 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">A quick count of the records connected to your account.</p></div>
          </div>
          <dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-input bg-[hsl(var(--surface-subtle))] py-4">
            <Count label="Purchases" value={purchaseCount} />
            <Count label="Subscriptions" value={subscriptionCount} />
            <Count label="Alerts" value={alertCount} />
          </dl>
          <p className="mt-5 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">AfterPrice does not connect to your bank or submit claims for you.</p>
        </Panel>
        <Panel>
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div><h3 className="font-display text-xl font-extrabold">Billing</h3><p className="mt-1 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">Manage an active Pro subscription in Stripe’s hosted customer portal.</p></div>
          </div>
          <div className="mt-5"><BillingPortalButton /></div>
        </Panel>
        <Panel className="bg-[hsl(var(--surface-dark))] text-[hsl(var(--foreground-on-dark))]">
          <p className="font-display text-lg font-extrabold">Session</p>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-on-dark)/.72)]">Sign out when you are done reviewing your records or using a shared device.</p>
          <form action={logout}><button type="submit" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-input bg-[hsl(var(--surface))] px-4 text-sm font-bold text-[hsl(var(--surface-dark))] hover:bg-accent hover:text-[hsl(var(--accent-foreground))]"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button></form>
        </Panel>
      </div>
    </div>
  </>
}

function ThemeOption({ value, current, label, description, onSelect }: { value: Theme; current: Theme; label: string; description: string; onSelect: (value: Theme) => void }) {
  const active = value === current
  const Icon = value === 'light' ? Sun : value === 'dark' ? Moon : Monitor

  return (
    <button type="button" aria-pressed={active} onClick={() => onSelect(value)} className={`flex min-h-[76px] w-full items-center justify-between gap-4 rounded-input border p-4 text-left transition-colors focus-visible:outline-none ${active ? 'border-accent bg-[hsl(var(--accent-soft))] ring-2 ring-accent/20' : 'border-border hover:bg-[hsl(var(--surface-subtle))]'}`}>
      <span className="flex min-w-0 items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-accent text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-muted))]'}`} aria-hidden="true"><Icon className="h-4 w-4" /></span>
        <span className="min-w-0"><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-[hsl(var(--foreground-secondary))]">{description}</span></span>
      </span>
      <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-bold ${active ? 'text-accent' : 'text-[hsl(var(--foreground-muted))]'}`}>{active ? <><CircleCheck className="h-4 w-4" aria-hidden="true" />Selected</> : 'Choose'}</span>
    </button>
  )
}

function Count({ label, value }: { label: string; value: number }) {
  return <div className="px-2 text-center"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--foreground-muted))]">{label}</dt><dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{value}</dd></div>
}
