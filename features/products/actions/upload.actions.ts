"use server"
import { backendFetch } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"

export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
    const token = await getAccessToken()

    if (!token) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const backendFormData = new FormData()
    backendFormData.append("file", file)

    try {
        const res = await backendFetch("/products/upload-image", {
            method: "POST",
            body: backendFormData,
            // DO NOT pass headers here — letting the runtime auto-set
            // Content-Type: multipart/form-data with the correct boundary
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({})) as any
            return { error: err.message || "Upload failed" }
        }

        const data = await res.json()
        return { url: data.url }
    } catch {
        return { error: "Upload failed" }
    }
}