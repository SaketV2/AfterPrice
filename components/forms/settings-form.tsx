'use client'

import { useActionState, useState } from 'react'
import { Bell, Check, Database, Eye, LogOut, UserRound } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { updatePreferences, type AfterPriceActionState } from '@/features/afterprice/actions'
import type { UserPreferences } from '@/features/afterprice/types'
import { useTheme, type Theme } from '@/lib/theme'
import { PageIntro, Panel, StatusBadge } from '@/components/dashboard/product-ui'

type NotificationPreferences = {
  priceDrops: boolean
  planChanges: boolean
  renewalWarnings: boolean
  weeklySummary: boolean
}

const initialState: AfterPriceActionState = {}
const inputClass = 'mt-2 h-12 w-full rounded-input border border-border bg-[hsl(var(--surface-subtle))] px-3.5 text-sm outline-none'

function Toggle({ name, label, description, checked, onChange }: { name: string; label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-5 rounded-input border border-border p-4 transition-colors hover:bg-[hsl(var(--surface-subtle))]"><span><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--foreground-secondary))]">{description}</span></span><span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-[hsl(var(--border-strong))]'}`}><input type="checkbox" name={name} checked={checked} onChange={event => onChange(event.target.checked)} className="sr-only" /><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></span></label>
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

  const notice = state.message ?? (pending ? 'Saving preferences…' : '')
  return <>
    <PageIntro title="Settings" description="Manage your account, notification preferences and how AfterPrice looks on this device." action={notice ? <StatusBadge tone={state.error ? 'danger' : 'success'}><Check className="h-3.5 w-3.5" />{notice}</StatusBadge> : undefined} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="space-y-6">
        <Panel><div className="flex items-start gap-3"><UserRound className="mt-0.5 h-5 w-5 text-accent" /><div><h3 className="font-display text-xl font-extrabold">Profile</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Your authenticated AfterPrice account.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><label htmlFor="displayName" className="text-sm font-bold">Display name<input id="displayName" value={displayName} readOnly className={`${inputClass} text-[hsl(var(--foreground-secondary))]`} /></label><label htmlFor="accountEmail" className="text-sm font-bold">Email<input id="accountEmail" value={email} readOnly className={`${inputClass} text-[hsl(var(--foreground-secondary))]`} /></label></div></Panel>
        <Panel><div className="flex items-start gap-3"><Bell className="mt-0.5 h-5 w-5 text-accent" /><div><h3 className="font-display text-xl font-extrabold">Notifications</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Choose which observed changes should enter your alert queue.</p></div></div><div className="mt-6 space-y-3"><Toggle name="notify_price_drops" label="Price-drop alerts" description="Notify me when a compatible purchase becomes cheaper." checked={notificationPreferences.priceDrops} onChange={value => savePreferences({ ...notificationPreferences, priceDrops: value })} /><Toggle name="notify_plan_changes" label="Plan-change alerts" description="Notify me when a subscription price or plan detail changes." checked={notificationPreferences.planChanges} onChange={value => savePreferences({ ...notificationPreferences, planChanges: value })} /><Toggle name="notify_renewals" label="Renewal warnings" description="Remind me before a recorded subscription renewal." checked={notificationPreferences.renewalWarnings} onChange={value => savePreferences({ ...notificationPreferences, renewalWarnings: value })} /><Toggle name="notify_weekly_summary" label="Weekly summary" description="Bundle non-urgent activity into a weekly note." checked={notificationPreferences.weeklySummary} onChange={value => savePreferences({ ...notificationPreferences, weeklySummary: value })} /></div>{state.error && <p role="alert" className="mt-4 rounded-input bg-[hsl(var(--danger-soft))] px-4 py-3 text-sm font-semibold text-[hsl(var(--danger))]">{state.error}</p>}</Panel>
      </div>
      <div className="space-y-6">
        <Panel><div className="flex items-start gap-3"><Eye className="mt-0.5 h-5 w-5 text-accent" /><div><h3 className="font-display text-xl font-extrabold">Appearance</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Use the same AfterPrice surfaces in light, dark or system mode.</p></div></div><div className="mt-6 space-y-2"><ThemeOption value="light" current={theme} label="Light" description="Warm paper and white surfaces" onSelect={chooseTheme} /><ThemeOption value="dark" current={theme} label="Dark" description="Graphite surfaces with high contrast" onSelect={chooseTheme} /><ThemeOption value="system" current={theme} label="System" description="Follow your device preference" onSelect={chooseTheme} /></div></Panel>
        <Panel><div className="flex items-start gap-3"><Database className="mt-0.5 h-5 w-5 text-accent" /><div><h3 className="font-display text-xl font-extrabold">Your data</h3><p className="mt-1 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">These counts reflect records attached to your authenticated account.</p></div></div><dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-input bg-[hsl(var(--surface-subtle))] py-4"><Count label="Purchases" value={purchaseCount} /><Count label="Subscriptions" value={subscriptionCount} /><Count label="Alerts" value={alertCount} /></dl><p className="mt-5 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">AfterPrice does not connect to your bank or submit claims on your behalf.</p></Panel>
        <Panel className="bg-[hsl(var(--surface-dark))] text-white"><p className="font-display text-lg font-extrabold">Session</p><p className="mt-2 text-sm leading-6 text-white/75">Sign out on a shared device or when you have finished reviewing your records.</p><form action={logout}><button type="submit" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-input bg-white px-4 text-sm font-bold text-[hsl(var(--surface-dark))] hover:bg-[hsl(var(--signal-lime))]"><LogOut className="h-4 w-4" />Log out</button></form></Panel>
      </div>
    </div>
  </>
}

function ThemeOption({ value, current, label, description, onSelect }: { value: Theme; current: Theme; label: string; description: string; onSelect: (value: Theme) => void }) {
  const active = value === current
  return <button type="button" aria-pressed={active} onClick={() => onSelect(value)} className={`flex min-h-[72px] w-full items-center justify-between gap-4 rounded-input border p-4 text-left transition-colors ${active ? 'border-accent bg-[hsl(var(--accent-soft))]' : 'border-border hover:bg-[hsl(var(--surface-subtle))]'}`}><span><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-[hsl(var(--foreground-secondary))]">{description}</span></span>{active && <Check className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}</button>
}

function Count({ label, value }: { label: string; value: number }) {
  return <div className="px-2 text-center"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--foreground-muted))]">{label}</dt><dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{value}</dd></div>
}
