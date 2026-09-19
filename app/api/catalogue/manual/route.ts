import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { normalizeManualProduct } from '@/server/catalogue/manual'
import { previewManualProduct } from '@/server/catalogue/manual-preview'
import { serverErrorResponse } from '@/lib/http/server-error'
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
    return NextResponse.json(previewManualProduct(product), { status: 200 })
  } catch (error) {
    return serverErrorResponse('catalogue.manual', error, {
      code: 'CATALOGUE_UNAVAILABLE',
      message: 'Manual product validation is temporarily unavailable.',
      status: 502,
    })
  }
}
