export function publicErrorPayload(code: string, message: string, requestId: string) {
  return { error: message, code, requestId }
}
