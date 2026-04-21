"use server"
import { backendFetch } from "@/lib/backend"
import { revalidatePath } from "next/cache"

export async function getShopSettings() {
    try {
        const res = await backendFetch("/shop-settings", { method: "GET" })
        if (!res.ok) {
            console.error("[getShopSettings]", res.status)
            return null
        }
        return res.json()
    } catch (error) {
        console.error("[getShopSettings] Error:", error)
        return null
    }
}

export async function updateShopSettings(data: Record<string, unknown>) {
    const res = await backendFetch("/shop-settings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any
        return { success: false as const, error: body?.message ?? `Error ${res.status}` }
    }
    revalidatePath("/admin/storefront")
    return { success: true as const, data: await res.json() }
}