import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:3000"

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value || req.cookies.get("access_token")?.value

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const res = await fetch(`${API_URL}/products/best-sellers?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        return NextResponse.json(data)
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}