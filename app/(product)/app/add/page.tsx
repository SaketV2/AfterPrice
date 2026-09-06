import { Suspense } from 'react'
import { AddItemForm } from '@/components/forms/add-item-form'

export default function AddPage() {
  return <Suspense fallback={<div className="h-80 animate-pulse rounded-[20px] bg-[var(--surface-subtle)]" />}><AddItemForm /></Suspense>
}

