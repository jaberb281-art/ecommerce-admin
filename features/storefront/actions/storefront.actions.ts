"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
}

export async function getShopSettings() {
    const token = await getToken()
    const res = await fetch(`${API_URL}/shop-settings`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
}

export async function updateShopSettings(data: Record<string, unknown>) {
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
}