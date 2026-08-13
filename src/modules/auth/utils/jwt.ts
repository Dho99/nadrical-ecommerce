export interface GoogleIdTokenPayload {
  email?: string
  email_verified?: boolean
  name?: string
  given_name?: string
  family_name?: string
  sub?: string
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

export function decodeGoogleIdToken(token: string): GoogleIdTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(base64UrlDecode(parts[1])) as GoogleIdTokenPayload
    if (typeof payload.email !== 'string') return null
    return payload
  } catch {
    return null
  }
}
