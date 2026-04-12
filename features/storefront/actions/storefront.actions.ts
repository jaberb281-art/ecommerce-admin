"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Safely build the API URL regardless of whether NEXT_PUBLIC_API_URL
// ends with /api or not — strip trailing /api first, then always add it once.
function buildApiUrl() {
    const raw = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000"
    const base = raw.replace(/\/api\/?$/, "").replace(/\/$/, "")
    return `${base}/api`
}

const API_URL = buildApiUrl()

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
}

export async function getShopSettings() {
    try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/shop-settings`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        })
        if (!res.ok) {
            console.error(`[storefront] getShopSettings ${res.status} from ${API_URL}/shop-settings`)
            return null
        }
        return res.json()
    } catch (err) {
        console.error("[storefront] getShopSettings error:", err)
        return null
    }
}

export async function updateShopSettings(data: Record<string, unknown>) {
    try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/shop-settings/update`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) {
            const err = await res.text()
            return { success: false, error: err || "Failed to save settings" }
        }
        revalidatePath("/admin/storefront")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message ?? "Network error" }
    }
}