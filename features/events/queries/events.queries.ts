"use server"

import { backendJSON } from "@/lib/backend"

interface Event {
    id: string
    title: string
    description?: string
    location: string
    venue?: string
    city: string
    startDate: string
    endDate?: string
    image?: string
    status: "UPCOMING" | "ONGOING" | "PAST" | "CANCELLED"
    isPublished: boolean
}

export async function getEvents(): Promise<Event[]> {
    try {
        return await backendJSON<Event[]>("/events/admin/all")
    } catch {
        return []
    }
}