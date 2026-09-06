import type { ReactNode } from 'react'
import { ProductShell } from '@/components/dashboard/product-ui'
import { SpendGuardProvider } from '@/lib/store/use-spendguard-store'

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <SpendGuardProvider><ProductShell>{children}</ProductShell></SpendGuardProvider>
}

