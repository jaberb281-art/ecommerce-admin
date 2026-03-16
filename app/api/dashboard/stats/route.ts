import { NextRequest, NextResponse } from "next/server"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value || req.cookies.get("access_token")?.value

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const [statsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/orders/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/users?limit=1`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ])

        const stats = await statsRes.json()
        const users = await usersRes.json()

        return NextResponse.json({
            ...stats,
            totalUsers: users?.meta?.total ?? 0,
        })
    } catch {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}