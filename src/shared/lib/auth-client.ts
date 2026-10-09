import { createAuthClient } from "better-auth/react"
import { getAuthToken } from "./api"

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8080/api/v1"
const baseURL = RAW_BASE.replace(/\/$/, "")

type FetchEsque = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function extractPath(url: string): string {
  try {
    const u = new URL(url, baseURL)
    const base = new URL(baseURL)
    const path = u.pathname.startsWith(base.pathname) ? u.pathname.slice(base.pathname.length) : u.pathname
    return path || "/"
  } catch {
    return url
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, message, error: message }, status)
}

async function readJsonBody(init?: RequestInit): Promise<Record<string, unknown>> {
  if (!init?.body) return {}
  if (typeof init.body === "string") {
    try { return JSON.parse(init.body) as Record<string, unknown> } catch { return {} }
  }
  if (init.body instanceof FormData) return {}
  return {}
}

function withTimeout(signal?: AbortSignal | null, ms = 10000): { signal: AbortSignal; cleanup: () => void } {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(new DOMException("Request timeout", "TimeoutError")), ms)
  const cleanup = () => clearTimeout(t)
  if (!signal) return { signal: ctrl.signal, cleanup }
  if (typeof AbortSignal.any === "function") {
    const anySig = AbortSignal.any([signal, ctrl.signal])
    const origCleanup = cleanup
    return { signal: anySig, cleanup: () => origCleanup() }
  }
  if (signal.aborted) ctrl.abort(signal.reason)
  else signal.addEventListener("abort", () => ctrl.abort(signal.reason), { once: true })
  return { signal: ctrl.signal, cleanup }
}

const goCustomFetch: FetchEsque = async (input, init) => {
  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url
  const path = extractPath(rawUrl)
  const method = (init?.method || "GET").toUpperCase()
  const body = await readJsonBody(init)
  const token = getAuthToken()
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  headers.set("Accept", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (init?.headers) {
    const h = new Headers(init.headers as HeadersInit)
    h.forEach((v, k) => {
      const lk = k.toLowerCase()
      if (lk === "content-type" || lk === "accept" || lk === "authorization") return
      headers.set(k, v)
    })
  }

  const goFetch = async (goPath: string, goMethod: string, goBody?: unknown): Promise<Response> => {
    const url = `${baseURL}${goPath.startsWith("/") ? goPath : `/${goPath}`}`
    const { signal, cleanup } = withTimeout(init?.signal ?? null, 10000)
    try {
      const res = await fetch(url, {
        method: goMethod,
        headers,
        body: goBody !== undefined ? JSON.stringify(goBody) : undefined,
        signal,
      })
      const text = await res.text()
      let data: unknown = null
      try { data = text ? JSON.parse(text) : null } catch { data = text as unknown }
      if (!res.ok) {
        const msg = (data as { message?: string })?.message || `Request failed (${res.status})`
        return errorResponse(msg, res.status)
      }
      return jsonResponse(data, res.status)
    } catch (e) {
      const err = e as DOMException & { name?: string }
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        return errorResponse("Request timeout — backend tidak merespon (10s). Cek VITE_API_BASE_URL / network.", 408)
      }
      const msg = e instanceof Error ? e.message : "Network error"
      return errorResponse(msg, 503)
    } finally {
      cleanup()
    }
  }

  const norm = path.replace(/\/$/, "") || "/"

  if (norm === "/sign-in/email" && method === "POST") {
    const email = String(body.email ?? "")
    const password = String(body.password ?? "")
    return goFetch("/auth/login", "POST", { identifier: email || String(body.username ?? ""), password })
  }
  if (norm === "/sign-up/email" && method === "POST") {
    const email = String(body.email ?? "")
    const password = String(body.password ?? "")
    const name = String(body.name ?? body.full_name ?? "")
    const cleanName = name.trim()
    const baseUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") || email.split("@")[0].replace(/[^a-z0-9]/g, "")
    const username = baseUsername.length >= 3 ? baseUsername : `${baseUsername}${Math.floor(100 + Math.random() * 900)}`
    return goFetch("/auth/register", "POST", { email: email.trim().toLowerCase(), username, password, full_name: cleanName })
  }
  if ((norm === "/sign-out" || norm === "/signOut") && method === "POST") {
    return jsonResponse({ success: true, message: "Signed out" })
  }
  if (norm === "/get-session" && method === "GET") {
    if (!token) return jsonResponse(null)
    const res = await goFetch("/auth/profile", "GET")
    if (!res.ok) return jsonResponse(null)
    const raw = (await res.clone().json()) as { data?: unknown; success?: boolean; message?: string } | unknown
    const akun = (raw as { data?: unknown })?.data ?? raw
    const a = akun as { uuid?: string; id?: string; email?: string; username?: string; full_name?: string; phone?: string; avatar_url?: string; image?: string; roles?: { nama_role: string }[] }
    if (!a || !a.email) return jsonResponse(null)
    return jsonResponse({
      session: { token, expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString() },
      user: {
        id: a.uuid || a.id || a.email,
        email: a.email,
        name: a.full_name || a.username || a.email.split("@")[0],
        image: a.avatar_url || a.image || null,
        emailVerified: true,
      },
    })
  }
  if (norm === "/update-user" && (method === "POST" || method === "PATCH" || method === "PUT")) {
    return goFetch("/auth/profile", "PUT", body)
  }

  return errorResponse(`Auth endpoint not mapped: ${method} ${path} — add mapping in src/shared/lib/auth-client.ts`, 404)
}

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    customFetchImpl: goCustomFetch as unknown as typeof fetch,
  },
})
