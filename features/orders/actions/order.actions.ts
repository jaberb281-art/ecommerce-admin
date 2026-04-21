import { backendFetch, backendJSON } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"
"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"


async function getToken() {
    const cookieStore = await cookies()
    return await getAccessToken()
}

export async function updateOrderStatus(
    orderId: string,
    status: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const token = await getToken()
        const res = await backendFetch("/orders/${orderId}/status", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }

        // Only revalidate after a confirmed success — this triggers
        // a background re-fetch without blanking the table
        revalidatePath("/admin/orders")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message ?? "Network error" }
    }
}