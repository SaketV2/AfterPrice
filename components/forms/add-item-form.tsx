'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSpendGuardStore } from '@/lib/store/use-spendguard-store'
import { PageIntro, Panel, StatusBadge } from '@/components/dashboard/product-ui'
import type { BillingCycle } from '@/lib/types'

type FormMode = 'purchase' | 'subscription'

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm outline-none transition placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'

function Field({ label, name, type = 'text', value, onChange, placeholder, required = true, min }: { label: string; name: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; min?: string }) {
  return <label className="block text-sm font-bold text-[var(--foreground)]">{label}{required && <span className="ml-1 text-[var(--danger)]">*</span>}<input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} min={min} step={type === 'number' ? '0.01' : undefined} className={inputClass} /></label>
}

export function AddItemForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addPurchase, addSubscription, addDocument } = useSpendGuardStore()
  const [mode, setMode] = useState<FormMode>(searchParams.get('type') === 'subscription' ? 'subscription' : 'purchase')
  const [product, setProduct] = useState('')
  const [retailer, setRetailer] = useState('')
  const [amount, setAmount] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [url, setUrl] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [service, setService] = useState('')
  const [plan, setPlan] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [renewalDate, setRenewalDate] = useState('')
  const [planUrl, setPlanUrl] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [receipt, setReceipt] = useState<{ name: string; parsed: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const resetStatus = () => { setError(''); setSaved(false) }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); resetStatus()
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) { setError('Enter an amount greater than $0.'); return }
    if (mode === 'purchase') {
      if (!product.trim() || !retailer.trim() || !purchaseDate) { setError('Complete the product, retailer and purchase date fields.'); return }
      addPurchase({ product: product.trim(), retailer: retailer.trim(), amount: numericAmount, purchaseDate, url: url.trim() || undefined, orderNumber: orderNumber.trim() || undefined })
    } else {
      if (!service.trim() || !plan.trim() || !renewalDate) { setError('Complete the service, plan and renewal date fields.'); return }
      addSubscription({ service: service.trim(), plan: plan.trim(), price: numericAmount, billingCycle, renewalDate, planUrl: planUrl.trim() || undefined })
    }
    setSaved(true)
    window.setTimeout(() => router.push('/app'), 600)
  }

  const uploadReceipt = (file: File | undefined) => {
    if (!file) return
    const supported = ['application/pdf', 'image/png', 'image/jpeg']
    if (!supported.includes(file.type)) { setError('Use a PDF, PNG or JPG receipt for the demo parser.'); return }
    setError(''); setReceipt({ name: file.name, parsed: false })
    addDocument({
      id: `document-${Date.now()}`,
      name: file.name,
      type: 'receipt',
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
    })
    window.setTimeout(() => { setReceipt({ name: file.name, parsed: true }); setProduct('Sony WH-1000XM6'); setRetailer('Amazon'); setAmount('349'); setPurchaseDate('2026-08-20'); setOrderNumber('SG-081240') }, 500)
  }

  return <>
    <PageIntro eyebrow="Add to your monitor" title="Watch something new" description="Add a purchase or subscription manually, or upload a demo receipt to pre-fill the details." />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel><div className="mb-6 flex rounded-xl bg-[var(--surface-subtle)] p-1"><button type="button" onClick={() => { setMode('purchase'); resetStatus() }} className={`flex-1 rounded-lg py-3 text-sm font-bold transition ${mode === 'purchase' ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-[var(--foreground-secondary)]'}`}>Add purchase</button><button type="button" onClick={() => { setMode('subscription'); resetStatus() }} className={`flex-1 rounded-lg py-3 text-sm font-bold transition ${mode === 'subscription' ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-[var(--foreground-secondary)]'}`}>Add subscription</button></div><form onSubmit={submit} noValidate className="space-y-5">{mode === 'purchase' ? <div className="grid gap-5 sm:grid-cols-2"><Field label="What did you buy?" name="product" value={product} onChange={setProduct} placeholder="Sony WH-1000XM6" /><Field label="Retailer" name="retailer" value={retailer} onChange={setRetailer} placeholder="Amazon" /><Field label="Amount paid" name="amount" type="number" value={amount} onChange={setAmount} placeholder="349" min="0.01" /><Field label="Purchase date" name="purchaseDate" type="date" value={purchaseDate} onChange={setPurchaseDate} /><Field label="Product URL" name="url" value={url} onChange={setUrl} placeholder="https://retailer.example/item" required={false} /><Field label="Order number" name="orderNumber" value={orderNumber} onChange={setOrderNumber} placeholder="Optional" required={false} /></div> : <div className="grid gap-5 sm:grid-cols-2"><Field label="Service" name="service" value={service} onChange={setService} placeholder="Notion" /><Field label="Plan" name="plan" value={plan} onChange={setPlan} placeholder="Plus" /><Field label="Price" name="price" type="number" value={amount} onChange={setAmount} placeholder="18" min="0.01" /><label className="block text-sm font-bold">Billing cycle<span className="ml-1 text-[var(--danger)]">*</span><select value={billingCycle} onChange={(event) => setBillingCycle(event.target.value as BillingCycle)} className={inputClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></label><Field label="Next renewal" name="renewalDate" type="date" value={renewalDate} onChange={setRenewalDate} /><Field label="Plan URL" name="planUrl" value={planUrl} onChange={setPlanUrl} placeholder="https://service.example/plans" required={false} /></div>}{error && <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}{saved && <p role="status" className="rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]">Added. Taking you to your overview…</p>}<div className="flex flex-col-reverse justify-end gap-3 border-t border-[var(--border)] pt-5 sm:flex-row"><button type="button" onClick={() => router.back()} className="min-h-11 rounded-xl border border-[var(--border)] px-5 text-sm font-bold hover:bg-[var(--surface-subtle)]">Cancel</button><button type="submit" className="min-h-11 rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-white hover:bg-[var(--accent-hover)]">Start watching</button></div></form></Panel>
      <div className="space-y-5"><Panel><p className="font-display text-lg font-extrabold">Upload a receipt</p><p className="mt-2 text-sm leading-6 text-[var(--foreground-secondary)]">The demo parser accepts a PDF, PNG or JPG and fills a few example fields for you to check.</p><button type="button" onClick={() => fileRef.current?.click()} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] px-4 text-sm font-bold text-[var(--accent)] hover:bg-[#dde1ff]">Choose receipt</button><input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => uploadReceipt(event.target.files?.[0])} />{receipt && <div className="mt-4 rounded-xl bg-[var(--surface-subtle)] p-3"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold">{receipt.name}</span><StatusBadge tone={receipt.parsed ? 'success' : 'accent'}>{receipt.parsed ? 'Parsed' : 'Reading'}</StatusBadge></div>{receipt.parsed && <p className="mt-2 text-xs leading-5 text-[var(--foreground-secondary)]">Fields were added to the purchase form. Review them before saving.</p>}</div>}</Panel><Panel className="bg-[var(--surface-dark)] text-white"><p className="font-display text-lg font-extrabold">Forward a receipt</p><p className="mt-2 text-sm leading-6 text-white/70">In V1 this is a demo address only. It is not provisioned for real email forwarding.</p><p className="mt-4 rounded-xl bg-white/10 px-3 py-3 text-center text-sm font-bold text-[var(--powder)]">yourname at in.spendguard.app</p></Panel></div>
    </div>
  </>
}
