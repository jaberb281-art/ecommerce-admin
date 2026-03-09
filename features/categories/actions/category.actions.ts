"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.API_URL || "http://localhost:3000"

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
}

export async function createCategory(name: string) {
    const token = await getToken()
    const res = await fetch(`${API_URL}/categories`, {
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

export async function updateCategory(id: string, name: string) {
    const token = await getToken()
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    })
    revalidatePath("/admin/categories")
    return res.json()
}

export async function deleteCategory(id: string) {
    const token = await getToken()
    await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    revalidatePath("/admin/categories")
}