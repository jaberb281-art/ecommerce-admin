import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth"

const API_BASE = (process.env.API_URL ?? "http://localhost:3000")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "")

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params
    const token = await getAccessToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params
    const token = await getAccessToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.text()
    const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body,
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params
    const token = await getAccessToken()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
}