"use server"

import { backendJSON } from "@/lib/backend"

export async function getDashboardStats() {
    try {
        return await backendJSON("/orders/admin/stats")
    } catch {
        return null
    }
}

export async function getLowStockProducts() {
    try {
        const data = await backendJSON<{ data: any[] }>("/products?limit=5")
        return data.data ?? []
    } catch {
        return []
    }
}

export async function getRecentProducts() {
    try {
        const data = await backendJSON<{ data: any[] }>("/products?limit=5")
        return data.data ?? []
    } catch {
        return []
    }
}