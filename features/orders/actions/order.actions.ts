"use server"
import { getAccessToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

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
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
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