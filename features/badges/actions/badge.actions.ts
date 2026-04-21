"use server"
import { backendFetch } from "@/lib/backend"
import { revalidatePath } from "next/cache"

export async function createBadge(formData: {
    name: string
    description?: string
    imageUrl?: string
    color?: string
}) {
    const res = await backendFetch("/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/badges")
    return res.json()
}

export async function updateBadge(id: string, formData: any) {
    const res = await backendFetch(`/badges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/badges")
    return res.json()
}

export async function deleteBadge(id: string) {
    await backendFetch(`/badges/${id}`, {
        method: "DELETE",
    })
    revalidatePath("/admin/badges")
}

// R4 fix: removed awardedBy from client interface — backend derives it from JWT
export async function awardBadge(badgeId: string, userId: string, note?: string) {
    const res = await backendFetch(`/badges/${badgeId}/award/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
    })
    revalidatePath("/admin/badges")
    return res.json()
}

export async function revokeBadge(badgeId: string, userId: string) {
    await backendFetch(`/badges/${badgeId}/revoke/${userId}`, {
        method: "DELETE",
    })
    revalidatePath("/admin/badges")
}

export async function uploadBadgeImage(formData: FormData) {
    const res = await backendFetch("/badges/upload-image", {
        method: "POST",
        body: formData,
    })
    return res.json()
}