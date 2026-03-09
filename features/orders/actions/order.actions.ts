"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.API_URL || "http://localhost:3000"

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