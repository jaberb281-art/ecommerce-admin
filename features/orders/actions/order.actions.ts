"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
}

export async function updateOrderStatus(orderId: string, status: string) {
    const token = await getToken()
    await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    })
    revalidatePath("/admin/orders")
}