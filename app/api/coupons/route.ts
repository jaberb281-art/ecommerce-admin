import { NextRequest, NextResponse } from "next/server"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export async function GET(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value

    const res = await fetch(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    return NextResponse.json(data)
}