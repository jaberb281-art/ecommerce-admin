"use server"
import { backendFetch } from "@/lib/backend"

export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const backendFormData = new FormData()
    backendFormData.append("file", file)

    try {
        const res = await backendFetch("/products/upload-image", {
            method: "POST",
            body: backendFormData,
            // DO NOT set Content-Type — let the runtime auto-set multipart/form-data + boundary
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({})) as any
            return { error: err.message || `Upload failed (${res.status})` }
        }

        const data = await res.json()
        return { url: data.url }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed"
        console.error("[uploadImage] error:", message)
        return { error: message }
    }
}