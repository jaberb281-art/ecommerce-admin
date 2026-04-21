"use server"
import { backendFetch } from "@/lib/backend"
import { revalidatePath } from "next/cache"

export async function createCoupon(formData: {
    code: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    maxUses?: number
    expiresAt?: string
    isActive: boolean
}) {
    const res = await backendFetch("/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/coupons")
    return res.json()
}

export async function updateCoupon(id: string, formData: any) {
    const res = await backendFetch(`/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/coupons")
    return res.json()
}

export async function deleteCoupon(id: string) {
    await backendFetch(`/coupons/${id}`, {
        method: "DELETE",
    })
    revalidatePath("/admin/coupons")
}