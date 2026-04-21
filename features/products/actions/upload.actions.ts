"use server"
import { backendFetch, backendJSON } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"
import { cookies } from "next/headers"


export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
    const cookieStore = await cookies()
    const token = await getAccessToken()

    if (!token) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const backendFormData = new FormData()
    backendFormData.append("file", file)

    try {
        const res = await backendFetch("/products/upload-image", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
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