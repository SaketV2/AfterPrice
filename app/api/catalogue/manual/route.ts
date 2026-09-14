import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { normalizeManualProduct, persistManualProduct } from '@/server/catalogue/manual'
import { validateSupportedUrl } from '@/server/monitoring/url-safety'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const manualProductSchema = z.object({
  displayName: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).optional(),
  modelNumber: z.string().trim().max(100).optional(),
  variant: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  aliases: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
  sourceUrl: z.string().trim().max(2000).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims || typeof claims.sub !== 'string') return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  let parsed: z.infer<typeof manualProductSchema>
  try {
    parsed = manualProductSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid product.' : 'Invalid JSON body.' }, { status: 400 })
  }
  if (parsed.sourceUrl) {
    const safeUrl = validateSupportedUrl(parsed.sourceUrl)
    if (!safeUrl.ok) return NextResponse.json({ error: safeUrl.reason }, { status: 400 })
    parsed.sourceUrl = safeUrl.url.toString()
  }
  try {
    const product = normalizeManualProduct(parsed)
    const entity = await persistManualProduct(supabase, claims.sub, product)
    return NextResponse.json({ product, entity }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Manual product could not be saved.' }, { status: 502 })
  }
}
