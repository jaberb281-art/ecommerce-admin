"use server"
import { backendFetch } from "@/lib/backend"
import { revalidatePath } from "next/cache"

export async function createCategory(name: string) {
    const res = await backendFetch("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    })
    revalidatePath("/admin/categories")
    return res.json()
}

export async function updateCategory(id: string, name: string, image?: string) {
    const res = await backendFetch(`/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            ...(image !== undefined && { image }),
        }),
    })
    revalidatePath("/admin/categories")
    return res.json()
}

export async function deleteCategory(id: string) {
    await backendFetch(`/categories/${id}`, {
        method: "DELETE",
    })
    revalidatePath("/admin/categories")
}

// Reuses the same upload endpoint as products
export async function uploadCategoryImage(
    formData: FormData
): Promise<{ url: string } | { error: string }> {
    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const backendFormData = new FormData()
    backendFormData.append("file", file)

    try {
        const res = await backendFetch("/products/upload-image", {
            method: "POST",
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