import { NextRequest, NextResponse } from "next/server"
import { backendFetch } from "@/lib/backend"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"

    try {
        const [revenueRes, ordersRes, topProductsRes, topCustomersRes, newCustomersRes] = await Promise.all([
            backendFetch(`/analytics/revenue?period=${period}`),
            backendFetch(`/analytics/orders?period=${period}`),
            backendFetch(`/analytics/top-products?limit=5`),
            backendFetch(`/analytics/top-customers?limit=5`),
            backendFetch(`/analytics/new-customers?period=${period}`),
        ])

        const [revenue, orders, topProducts, topCustomers, newCustomers] = await Promise.all([
            revenueRes.json(),
            ordersRes.json(),
            topProductsRes.json(),
            topCustomersRes.json(),
            newCustomersRes.json(),
        ])

        return NextResponse.json({ revenue, orders, topProducts, topCustomers, newCustomers })
    } catch {
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
}