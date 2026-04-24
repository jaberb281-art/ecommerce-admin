import { getAccessToken } from "./auth"

/**
 * Resolves the backend base URL from the private API_URL env var.
 * Server actions should NEVER use NEXT_PUBLIC_API_URL — that's for browser code.
 */
function resolveBackendBase(): string {
    const raw = process.env.API_URL
    if (!raw) throw new Error("[backend] API_URL is not set")
    return raw.replace(/\/api\/?$/, "").replace(/\/$/, "")
}

/**
 * Authenticated fetch to the backend. Automatically attaches the current
 * user's JWT. Use this in all server actions and server-side queries.
 */
export async function backendFetch(
    path: string,
    init: RequestInit = {},
): Promise<Response> {
    const token = await getAccessToken()
    const base = resolveBackendBase()
    const cleanPath = path.startsWith("/") ? path : `/${path}`

    // When body is FormData, do NOT spread a plain headers object — doing so
    // prevents the runtime from auto-setting Content-Type with the multipart
    // boundary, which breaks file uploads. Instead, use the Headers class so
    // the runtime can still append its own Content-Type alongside Authorization.
    let headers: Headers
    if (init.body instanceof FormData) {
        headers = new Headers(init.headers)
        if (token) headers.set("Authorization", `Bearer ${token}`)
    } else {
        headers = new Headers({
            ...(init.headers as Record<string, string> ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        })
    }

    return fetch(`${base}/api${cleanPath}`, {
        ...init,
        headers,
        cache: "no-store",
    })
}

/**
 * Like backendFetch but parses and returns JSON directly.
 * Throws on non-OK responses with the backend error message.
 */
export async function backendJSON<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const res = await backendFetch(path, init)
    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any
        throw new Error(body?.message ?? `Backend error ${res.status}`)
    }
    return res.json()
}