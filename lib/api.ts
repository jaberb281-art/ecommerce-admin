// lib/api.ts — central server-side fetch utility
import { redirect } from "next/navigation"
import { getAccessToken } from "./auth"

const API_BASE = (process.env.API_URL ?? "http://localhost:3000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "")

export async function serverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()

  if (!token) redirect("/login")

  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const fullUrl = `${API_BASE}/api${cleanPath}`

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  })

  if (res.status === 401) redirect("/login")

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown Error")
    throw new Error(`API error: ${res.status} - ${errorText}`)
  }

  return res.json()
}