import 'server-only'

import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { publicErrorPayload } from './public-error'

export function createRequestId() {
  return randomUUID()
}

export function serverErrorResponse(
  scope: string,
  error: unknown,
  response: { code: string; message: string; status: number; requestId?: string },
) {
  const requestId = response.requestId ?? createRequestId()
  console.error(`[${scope}:${requestId}] Request failed.`, error)
  return NextResponse.json(
    publicErrorPayload(response.code, response.message, requestId),
    { status: response.status, headers: { 'Cache-Control': 'private, no-store' } },
  )
}
