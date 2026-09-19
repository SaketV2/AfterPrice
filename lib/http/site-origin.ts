const PRODUCTION_SITE_ORIGIN = 'https://afterprice.vercel.app'
const DEVELOPMENT_SITE_ORIGIN = 'http://localhost:3000'

function validOrigin(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null
    return url.origin
  } catch {
    return null
  }
}

export function getPublicSiteOrigin(environment = process.env): string {
  return validOrigin(environment.NEXT_PUBLIC_SITE_URL)
    ?? (environment.NODE_ENV === 'production' ? PRODUCTION_SITE_ORIGIN : DEVELOPMENT_SITE_ORIGIN)
}
