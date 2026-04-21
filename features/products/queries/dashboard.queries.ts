"use server"

import { backendJSON } from "@/lib/backend"

export async function getDashboardStats() {
    try {
        return await backendJSON("/orders/admin/stats")
    } catch {
        return null
    }
}

interface LowStockProduct {
    id: string
    name: string
    stock: number
    images: string[]
    category: { name: string } | null
}

export async function getLowStockProducts(threshold = 10): Promise<LowStockProduct[]> {
    try {
        return await backendJSON<LowStockProduct[]>(
            `/products/admin/low-stock?threshold=${threshold}&limit=20`
        )
    } catch {
        return []
    }
}

interface Product {
    id: string
    name: string
    price: number
    stock: number
    images: string[]
    status: string
    createdAt: string
}

export async function getRecentProducts(): Promise<Product[]> {
    try {
        const data = await backendJSON<{ data: Product[] }>("/products/admin/all?limit=5")
        return data.data ?? []
    } catch {
        return []
    }
}