"use server"

import { backendJSON } from "@/lib/backend"

export async function getEvents() {
    try {
        return await backendJSON("/events/admin/all")
    } catch {
        return []
    }
}