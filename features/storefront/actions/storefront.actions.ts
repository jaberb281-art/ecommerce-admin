"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Match the exact same URL pattern used by users/page.tsx and orders/page.tsx
// which are confirmed to work in production
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

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
            console.error(`getShopSettings failed: ${res.status} ${await res.text()}`)
            return null
        }
        return res.json()
    } catch (err) {
        console.error("getShopSettings error:", err)
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