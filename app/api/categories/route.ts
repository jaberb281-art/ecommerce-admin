import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:3000"

// Change { params }: { params: { id: string } } 
// To { params }: { params: Promise<{ id: string }> }
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Await the params promise here
    const token = req.cookies.get("token")?.value || req.cookies.get("access_token")?.value

    // Use the awaited id variable
    const res = await fetch(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    return NextResponse.json(data)
}