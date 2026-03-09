import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:3000"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const token = req.cookies.get("token")?.value || req.cookies.get("access_token")?.value
    const res = await fetch(`${API_URL}/categories/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return NextResponse.json(data)
}