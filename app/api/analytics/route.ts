import { NextRequest, NextResponse } from "next/server"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export async function GET(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"

    try {
        const [revenueRes, ordersRes, topProductsRes, topCustomersRes, newCustomersRes] = await Promise.all([
            fetch(`${API_URL}/analytics/revenue?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/analytics/orders?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/analytics/top-products?limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/analytics/top-customers?limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/analytics/new-customers?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
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