import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const API_URL = process.env.API_URL!.replace(/\/$/, "")

        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const error = await res.json().catch(() => ({}))
            return NextResponse.json(
                { error: error.message || "Invalid credentials" },
                { status: res.status }
            )
        }

        const data = await res.json()

        // Verify the user is actually an ADMIN before granting access
        if (data.user?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Access denied. Admin accounts only." },
                { status: 403 }
            )
        }

        const response = NextResponse.json({ success: true, user: data.user })

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge: 60 * 60 * 8, // 8 hours for admin sessions (shorter than storefront)
        }

        response.cookies.set("access_token", data.access_token, cookieOptions)
        response.cookies.set(
            "user",
            encodeURIComponent(JSON.stringify(data.user)),
            { ...cookieOptions, httpOnly: false } // user info can be readable by JS, just not the token
        )

        return response
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}