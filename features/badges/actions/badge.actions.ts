"use server"
import { backendFetch, backendJSON } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"


async function getToken() {
    const cookieStore = await cookies()
    return await getAccessToken()
}

export async function createBadge(formData: {
    name: string
    description?: string
    imageUrl?: string
    color?: string
}) {
    const token = await getToken()
    const res = await backendFetch("/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/badges")
    return res.json()
}

export async function updateBadge(id: string, formData: any) {
    const token = await getToken()
    const res = await backendFetch("/badges/${id}", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
    })
    revalidatePath("/admin/badges")
    return res.json()
}

export async function deleteBadge(id: string) {
    const token = await getToken()
    await backendFetch("/badges/${id}", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    revalidatePath("/admin/badges")
}

export async function awardBadge(badgeId: string, userId: string, awardedBy: string, note?: string) {
    const token = await getToken()
    const res = await backendFetch("/badges/${badgeId}/award/${userId}", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ awardedBy, note }),
    })
    revalidatePath("/admin/badges")
    return res.json()
}

export async function revokeBadge(badgeId: string, userId: string) {
    const token = await getToken()
    await backendFetch("/badges/${badgeId}/revoke/${userId}", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    revalidatePath("/admin/badges")
}

export async function uploadBadgeImage(formData: FormData) {
    const token = await getToken()
    const res = await backendFetch("/badges/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    return res.json()
}