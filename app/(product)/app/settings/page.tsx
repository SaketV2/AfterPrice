import { SettingsForm } from '@/components/forms/settings-form'
import { getAlerts, getBaselines, getUserPreferences } from '@/features/afterprice/queries'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const [{ data }, records, preferences, alerts] = await Promise.all([supabase.auth.getClaims(), getBaselines(), getUserPreferences(), getAlerts()])
  const email = typeof data?.claims?.email === 'string' ? data.claims.email : 'Account email unavailable'
  const metadata = data?.claims?.user_metadata
  const displayName = typeof metadata === 'object' && metadata && 'display_name' in metadata && typeof metadata.display_name === 'string' ? metadata.display_name : email.split('@')[0]
  return <SettingsForm email={email} displayName={displayName} purchaseCount={records.filter(record => record.baseline_type === 'purchase').length} subscriptionCount={records.filter(record => record.baseline_type === 'subscription').length} alertCount={alerts.length} preferences={preferences} />
}
