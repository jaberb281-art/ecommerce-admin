import { getAccessToken } from "@/lib/auth"
"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import axios from "axios"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

async function getToken() {
    const cookieStore = await cookies()
    return await getAccessToken()
}

function handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || "Something went wrong."
    }
    return "Something went wrong. Please try again."
}

export async function createEvent(data: unknown) {
    try {
        const token = await getToken()
        const { data: result } = await axios.post(`${API_URL}/events`, data, {
            headers: { Authorization: `Bearer ${token}` },
        })
        revalidatePath("/admin/events")
        return { success: true, data: result }
    } catch (error) {
        return { success: false, error: handleError(error) }
    }
}

export async function updateEvent(id: string, data: unknown) {
    try {
        const token = await getToken()
        const { data: result } = await axios.patch(`${API_URL}/events/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        })
        revalidatePath("/admin/events")
        return { success: true, data: result }
    } catch (error) {
        return { success: false, error: handleError(error) }
    }
}

export async function deleteEvent(id: string) {
    try {
        const token = await getToken()
        await axios.delete(`${API_URL}/events/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        revalidatePath("/admin/events")
        return { success: true }
    } catch (error) {
        return { success: false, error: handleError(error) }
    }
}

export async function toggleEventPublish(id: string) {
    try {
        const token = await getToken()
        const { data: result } = await axios.patch(`${API_URL}/events/${id}/toggle-publish`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        })
        revalidatePath("/admin/events")
        return { success: true, data: result }
    } catch (error) {
        return { success: false, error: handleError(error) }
    }
}