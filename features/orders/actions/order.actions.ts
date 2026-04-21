"use server"
import { backendFetch } from "@/lib/backend"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(
    orderId: string,
    status: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await backendFetch(`/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            return { success: false, error: (body as any)?.message ?? `Error ${res.status}` }
        }

        revalidatePath("/admin/orders")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message ?? "Network error" }
    }
}