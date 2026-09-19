import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchCatalogue } from '@/server/catalogue/service'
import { createRequestId, serverErrorResponse } from '@/lib/http/server-error'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAuthenticated(claims: unknown): claims is { sub: string } {
  return Boolean(claims && typeof claims === 'object' && 'sub' in claims && typeof claims.sub === 'string')
}

export async function GET(request: NextRequest) {
  const requestId = createRequestId()
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!isAuthenticated(data?.claims)) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const query = request.nextUrl.searchParams.get('q') ?? request.nextUrl.searchParams.get('query') ?? ''
  const parsedLimit = Number(request.nextUrl.searchParams.get('limit') ?? '8')
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(Math.trunc(parsedLimit), 20)) : 8
  try {
    const result = await searchCatalogue(supabase, query, { limit, requestId })
    return NextResponse.json({
      products: result.products,
      source: result.source,
      externalLookupAttempted: result.externalLookupAttempted,
      cache: { attempted: result.cache.attempted, persisted: result.cache.persisted },
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return serverErrorResponse('catalogue.search', error, {
      code: 'CATALOGUE_UNAVAILABLE',
      message: 'Catalogue search is temporarily unavailable.',
      status: 502,
      requestId,
    })
  }
}
