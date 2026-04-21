import { backendFetch, backendJSON } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"
"use server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"


async function getToken() {
    const cookieStore = await cookies()
    return await getAccessToken()
}

export async function createCategory(name: string) {
    const token = await getToken()
    const res = await backendFetch("/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    })
    revalidatePath("/admin/categories")
    return res.json()
}

export async function updateCategory(id: string, name: string, image?: string) {
    const token = await getToken()
    const res = await backendFetch("/categories/${id}", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
            ...(image !== undefined && { image }),
        }),
    })
    revalidatePath("/admin/categories")
    return res.json()
}

export async function deleteCategory(id: string) {
    const token = await getToken()
    await backendFetch("/categories/${id}", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    revalidatePath("/admin/categories")
}

// Reuses the same upload endpoint as products
export async function uploadCategoryImage(
    formData: FormData
): Promise<{ url: string } | { error: string }> {
    const token = await getToken()
    if (!token) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const backendFormData = new FormData()
    backendFormData.append("file", file)

    try {
        const res = await backendFetch("/products/upload-image", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: backendFormData,
        })

        if (!res.ok) {
            const err = await res.json()
            return { error: err.message || "Upload failed" }
        }

        const data = await res.json()
        return { url: data.url }
    } catch {
        return { error: "Upload failed" }
    }
}