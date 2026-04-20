import { getAccessToken } from "@/lib/auth"
"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

async function getToken() {
    const cookieStore = await cookies()
    return await getAccessToken()
}

export async function createCoupon(formData: {
    code: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    maxUses?: number
    expiresAt?: string
    isActive: boolean
}) {
    const token = await getToken()
    const res = await fetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/coupons")
    return res.json()
}

export async function updateCoupon(id: string, formData: any) {
    const token = await getToken()
    const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/coupons")
    return res.json()
}

export async function deleteCoupon(id: string) {
    const token = await getToken()
    await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    revalidatePath("/admin/coupons")
}