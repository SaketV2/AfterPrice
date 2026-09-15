'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, CircleHelp, PackageSearch, Search, ShoppingBag, WalletCards } from 'lucide-react'
import { createBaseline, type BaselineState } from '@/features/baselines/actions'
import type { Entity } from '@/features/afterprice/types'
import { PageIntro, Panel, StatusBadge } from '@/components/dashboard/product-ui'

type ItemType = 'purchase' | 'subscription'
const initialState: BaselineState = {}
const inputClass = 'mt-2 h-12 w-full rounded-input border border-border bg-background px-3.5 text-sm text-foreground outline-none transition placeholder:text-[hsl(var(--foreground-muted))] focus:border-accent focus:ring-2 focus:ring-[hsl(var(--accent-soft))]'

function normalise(value: string) {
  return value.toLowerCase().replace(/[\s\-_]+/g, '')
}

function Field({ label, name, type = 'text', value, onChange, placeholder, optional = false, min, step }: { label: string; name: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string; optional?: boolean; min?: string; step?: string }) {
  return <label htmlFor={name} className="block min-w-0 text-sm font-semibold">{label}{optional && <span className="ml-1 font-normal text-[hsl(var(--foreground-secondary))]">(optional)</span>}<input id={name} name={name} type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} required={!optional} min={min} step={step} className={inputClass} /></label>
}

function Stage({ number, title, description, children }: { number: number; title: string; description: string; children: React.ReactNode }) {
  return <section className="border-t border-border py-6 first:border-t-0 first:pt-0 last:pb-0"><div className="grid gap-4 sm:grid-cols-[40px_minmax(0,1fr)]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--surface-subtle))] font-display text-lg font-extrabold" aria-hidden="true">{number}</span><div className="min-w-0"><h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">{title}</h3><p className="mt-1 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">{description}</p><div className="mt-5">{children}</div></div></div></section>
}

export function AddItemForm({ entities, suggestionLabel }: { entities: Entity[]; suggestionLabel: string }) {
  const searchParams = useSearchParams()
  const [state, action, pending] = useActionState(createBaseline, initialState)
  const [type, setType] = useState<ItemType>(searchParams.get('type') === 'subscription' ? 'subscription' : 'purchase')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [remoteEntities, setRemoteEntities] = useState<Entity[]>([])
  const [remoteSearchKey, setRemoteSearchKey] = useState('')
  const [searchingKey, setSearchingKey] = useState('')
  const searchTerm = query.trim()
  const searchKey = `${type}:${searchTerm}`
  const searching = searchingKey === searchKey
  const allEntities = useMemo(() => {
    const visibleRemoteEntities = remoteSearchKey === searchKey ? remoteEntities : []
    return [...entities, ...visibleRemoteEntities.filter(remote => !entities.some(entity => entity.id === remote.id))]
  }, [entities, remoteEntities, remoteSearchKey, searchKey])
  const selected = useMemo(() => allEntities.find(entity => entity.id === selectedId), [allEntities, selectedId])
  const options = useMemo(() => allEntities.filter(entity => entity.entity_type === (type === 'purchase' ? 'retail_product' : 'subscription')).filter(entity => {
    const text = normalise(`${entity.display_name} ${entity.provider} ${entity.brand ?? ''} ${entity.variant ?? ''}`)
    return !query.trim() || text.includes(normalise(query))
  }).slice(0, 8), [allEntities, query, type])
  const [provider, setProvider] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [brand, setBrand] = useState('')
  const [variant, setVariant] = useState('')
  const [sizeLabel, setSizeLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [capturedAt, setCapturedAt] = useState('')
  const [planName, setPlanName] = useState('')
  const [billingInterval, setBillingInterval] = useState('monthly')
  const [renewalAt, setRenewalAt] = useState('')
  const [returnDeadline, setReturnDeadline] = useState('')
  const [returnDeadlineSource, setReturnDeadlineSource] = useState('unknown')
  const [sourceUrl, setSourceUrl] = useState('')

  useEffect(() => {
    if (type !== 'purchase' || searchTerm.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchingKey(searchKey)
      try {
        const response = await fetch(`/api/catalogue/search?q=${encodeURIComponent(searchTerm)}&limit=8`, { signal: controller.signal })
        if (!response.ok) return
        const result = await response.json() as { products?: Array<{ catalogProductId?: string; canonicalKey: string; displayName: string; brand?: string; modelNumber?: string; category?: string }> }
        setRemoteEntities((result.products ?? []).flatMap(product => product.catalogProductId ? [{ id: product.catalogProductId, entity_type: 'retail_product' as const, provider: product.brand ?? 'Catalogue', external_id: product.canonicalKey, display_name: product.displayName, brand: product.brand ?? null, variant: product.modelNumber ?? null, size_label: null, category: product.category ?? null, source_url: null, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }] : []))
        setRemoteSearchKey(searchKey)
      } catch {
        if (!controller.signal.aborted) setRemoteEntities([])
      } finally {
        if (!controller.signal.aborted) setSearchingKey(current => current === searchKey ? '' : current)
      }
    }, 220)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [searchKey, searchTerm, type])

  function chooseType(next: ItemType) {
    setType(next); setQuery(''); setSelectedId(''); setProvider(''); setDisplayName(''); setBrand(''); setVariant(''); setSizeLabel(''); setPlanName(''); setBillingInterval('monthly'); setRenewalAt(''); setReturnDeadline(''); setReturnDeadlineSource('unknown')
  }

  function chooseEntity(entity: Entity) {
    setSelectedId(entity.id); setProvider(entity.provider); setDisplayName(entity.display_name); setBrand(entity.brand ?? ''); setVariant(entity.variant ?? ''); setSizeLabel(entity.size_label ?? '')
    if (type === 'subscription') setPlanName(entity.variant ?? '')
  }

  return <>
    <PageIntro title="Add an item to monitor." description="Start with the record you already have. AfterPrice keeps your baseline separate from later observations so a useful difference is easy to see." />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Panel className="min-w-0">
        <form action={action} className="space-y-0"><input type="hidden" name="baseline_type" value={type} /><input type="hidden" name="entity_id" value={selectedId} />
          <Stage number={1} title="What are you adding?" description="Choose the kind of baseline you want to keep."><div role="group" aria-label="Item type" className="grid gap-2 sm:grid-cols-2"><button type="button" aria-pressed={type === 'purchase'} onClick={() => chooseType('purchase')} className={`flex min-h-16 items-center gap-3 rounded-input border px-4 text-left text-sm font-bold transition-colors ${type === 'purchase' ? 'border-accent bg-[hsl(var(--accent-soft))] text-foreground' : 'border-border text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--surface-subtle))]'}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-accent"><ShoppingBag className="h-4 w-4" /></span><span><span className="block">Purchase</span><span className="mt-1 block text-xs font-normal text-[hsl(var(--foreground-secondary))]">A one-time product or service</span></span></button><button type="button" aria-pressed={type === 'subscription'} onClick={() => chooseType('subscription')} className={`flex min-h-16 items-center gap-3 rounded-input border px-4 text-left text-sm font-bold transition-colors ${type === 'subscription' ? 'border-accent bg-[hsl(var(--accent-soft))] text-foreground' : 'border-border text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--surface-subtle))]'}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-accent"><WalletCards className="h-4 w-4" /></span><span><span className="block">Subscription</span><span className="mt-1 block text-xs font-normal text-[hsl(var(--foreground-secondary))]">A recurring charge and renewal</span></span></button></div></Stage>
          <Stage number={2} title={type === 'purchase' ? 'Find the product' : 'Find the service'} description="Search the shared catalogue first. A match keeps identity details consistent for later observations."><label htmlFor="catalogue-search" className="relative block"><span className="sr-only">Search catalogue</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-muted))]" /><input id="catalogue-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={type === 'purchase' ? 'Search products, brands or model numbers' : 'Search services'} className={`${inputClass} pl-10`} /></label><div className="mt-5 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--foreground-muted))]">{query.trim() ? 'Search results' : type === 'purchase' ? suggestionLabel : 'Recognised services'}</p>{selected && <StatusBadge tone="success">Catalogue match</StatusBadge>}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{options.length ? options.map(entity => <button type="button" key={entity.id} onClick={() => chooseEntity(entity)} className={`flex min-h-16 items-start gap-3 rounded-input border p-3 text-left transition-colors ${selectedId === entity.id ? 'border-accent bg-[hsl(var(--accent-soft))]' : 'border-border hover:bg-[hsl(var(--surface-subtle))]'}`}><span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selectedId === entity.id ? 'bg-accent text-white' : 'bg-[hsl(var(--surface-subtle))] text-accent'}`}>{selectedId === entity.id ? <Check className="h-4 w-4" /> : <PackageSearch className="h-4 w-4" />}</span><span className="min-w-0"><span className="block truncate text-sm font-bold">{entity.display_name}</span><span className="mt-1 block truncate text-xs text-[hsl(var(--foreground-secondary))]">{entity.provider}{entity.brand ? ` · ${entity.brand}` : ''}{entity.variant ? ` · ${entity.variant}` : ''}</span></span></button>) : <div className="col-span-full rounded-input border border-dashed border-border px-4 py-4 text-sm text-[hsl(var(--foreground-secondary))]">{searching ? 'Searching the catalogue…' : 'No local matches for this search. Continue with a manual item below.'}</div>}</div><p className="mt-4 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">Can&apos;t find your {type === 'purchase' ? 'product' : 'service'}? Leave the catalogue selection blank and add it manually. Manual items begin with limited or manual monitoring.</p></Stage>
          <Stage number={3} title="Add the details" description="These fields describe your own record. Amounts are stored in AUD."><div className="grid gap-5 sm:grid-cols-2"><Field label={type === 'purchase' ? 'Purchased from' : 'Provider'} name="provider" value={provider} onChange={setProvider} placeholder={type === 'purchase' ? 'e.g. Sony Store' : 'e.g. Spotify'} /><Field label={type === 'purchase' ? 'Product name' : 'Service name'} name="display_name" value={displayName} onChange={setDisplayName} placeholder={type === 'purchase' ? 'e.g. WH-1000XM6' : 'e.g. Spotify'} />{type === 'purchase' ? <><Field label="Brand" name="brand" value={brand} onChange={setBrand} placeholder="e.g. Sony" optional /><Field label="Variant or model" name="variant" value={variant} onChange={setVariant} placeholder="e.g. WH-1000XM6" optional /><Field label="Pack size" name="size_label" value={sizeLabel} onChange={setSizeLabel} placeholder="e.g. 1 item" optional /></> : <Field label="Plan name" name="plan_name" value={planName} onChange={setPlanName} placeholder="e.g. Premium" optional />}</div></Stage>
          <Stage number={4} title="Set the useful timing" description={type === 'purchase' ? 'Add the dates that help you decide whether a price difference is still useful.' : 'Add the billing and renewal details that help you review a subscription in time.'}><div className="grid gap-5 sm:grid-cols-2"><Field label={type === 'purchase' ? 'Amount paid (AUD)' : 'Price per billing cycle (AUD)'} name="amount" type="number" value={amount} onChange={setAmount} placeholder="0.00" min="0" step="0.01" /><Field label={type === 'purchase' ? 'Purchase date' : 'Baseline date'} name="captured_at" type="date" value={capturedAt} onChange={setCapturedAt} />{type === 'subscription' && <label htmlFor="billing_interval" className="block text-sm font-semibold">Billing interval<select id="billing_interval" name="billing_interval" value={billingInterval} onChange={event => setBillingInterval(event.target.value)} className={inputClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option><option value="one_off">One-off</option></select></label>}{type === 'subscription' && <Field label="Next renewal date" name="renewal_at" type="date" value={renewalAt} onChange={setRenewalAt} optional />}{type === 'purchase' && <Field label="Return deadline" name="return_deadline" type="date" value={returnDeadline} onChange={setReturnDeadline} optional />}{type === 'purchase' && <label htmlFor="return_deadline_source" className="block text-sm font-semibold">Deadline confidence<select id="return_deadline_source" name="return_deadline_source" value={returnDeadlineSource} onChange={event => setReturnDeadlineSource(event.target.value)} className={inputClass}><option value="unknown">Unknown</option><option value="user_confirmed">I confirmed it</option><option value="retailer_policy">Retailer policy</option><option value="estimated">Estimated</option></select></label>}</div><div className="mt-5"><Field label="Original source URL" name="source_url" type="url" value={sourceUrl} onChange={setSourceUrl} placeholder="https://…" optional /></div></Stage>
          <Stage number={5} title="Add item" description="Save the baseline. Later compatible observations will be kept separately so changes remain traceable."><div className="flex flex-col-reverse gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[hsl(var(--foreground-secondary))]">You can edit or delete this baseline later.</p><button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-input bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-[hsl(var(--accent-hover))] disabled:cursor-wait disabled:opacity-60">{pending ? 'Saving…' : 'Save item'}<ArrowRight className="h-4 w-4" /></button></div></Stage>
          {state.error && <p role="alert" className="mt-6 rounded-input bg-[hsl(var(--danger-soft))] px-4 py-3 text-sm font-semibold leading-6 text-[hsl(var(--danger))]">{state.error}</p>}
        </form>
      </Panel>
      <aside className="space-y-5 xl:sticky xl:top-24"><Panel><div className="flex items-start gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><h3 className="font-display text-lg font-extrabold">Why add this item?</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">A clear baseline makes a later difference useful. AfterPrice keeps the evidence and relevant timing beside it.</p></div></div><div className="mt-5 space-y-4 border-t border-border pt-5 text-sm"><div><p className="font-bold">Known catalogue match</p><p className="mt-1 leading-5 text-[hsl(var(--foreground-secondary))]">Canonical identity is saved with the record.</p></div><div><p className="font-bold">Manual item</p><p className="mt-1 leading-5 text-[hsl(var(--foreground-secondary))]">The record is saved, but monitoring capability depends on a supported source.</p></div><div><p className="font-bold">Your record stays fixed</p><p className="mt-1 leading-5 text-[hsl(var(--foreground-secondary))]">Later prices, plans and renewal notices are stored as separate observations.</p></div></div></Panel></aside>
    </div>
  </>
}
