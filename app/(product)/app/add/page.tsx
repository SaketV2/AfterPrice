import { AddItemForm } from '@/components/forms/add-item-form'
import { getEntities } from '@/features/afterprice/queries'

export const metadata = { title: 'Add item' }

export default async function AddPage() {
  const catalogue = await getEntities()
  return <AddItemForm entities={catalogue.entities} suggestionLabel={catalogue.productLabel} />
}
