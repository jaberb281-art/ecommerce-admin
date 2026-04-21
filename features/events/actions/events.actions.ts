"use server"

import { revalidatePath } from "next/cache"
import { backendFetch } from "@/lib/backend"

export async function createEvent(data: unknown) {
    try {
        const res = await backendFetch("/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        revalidatePath("/admin/events")
        return { success: true, data: await res.json() }
    } catch (error) {
        console.error("[createEvent]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function updateEvent(id: string, data: unknown) {
    try {
        const res = await backendFetch(`/events/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        revalidatePath("/admin/events")
        return { success: true, data: await res.json() }
    } catch (error) {
        console.error("[updateEvent]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function deleteEvent(id: string) {
    try {
        const res = await backendFetch(`/events/${id}`, { method: "DELETE" })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        revalidatePath("/admin/events")
        return { success: true }
    } catch (error) {
        console.error("[deleteEvent]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function toggleEventPublish(id: string) {
    try {
        const res = await backendFetch(`/events/${id}/toggle-publish`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        revalidatePath("/admin/events")
        return { success: true, data: await res.json() }
    } catch (error) {
        console.error("[toggleEventPublish]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}