export function safeAppPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== 'string') return '/app'
  if (!(value === '/app' || value.startsWith('/app/')) || value.startsWith('//') || value.includes('\\')) return '/app'
  try {
    const parsed = new URL(value, 'https://afterprice.local')
    if (parsed.origin !== 'https://afterprice.local' || !parsed.pathname.startsWith('/app')) return '/app'
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return '/app'
  }
}
