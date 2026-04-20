import { NextRequest, NextResponse } from "next/server"

function getTokenMaxAge(jwt: string): number {
    try {
        const [, payloadB64] = jwt.split(".")
        const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
        if (typeof payload.exp === "number") {
            const seconds = payload.exp - Math.floor(Date.now() / 1000)
            return Math.max(0, seconds)
        }
    } catch { }
    return 60 * 15 // safe fallback: 15 minutes
}

export async function POST(req: NextRequest) {
    try {
        const { ticket } = await req.json()

        if (!ticket) {
            return NextResponse.json({ error: "Missing exchange ticket" }, { status: 400 })
        }

        const API_URL = process.env.API_URL!.replace(/\/$/, "")

        // Forward the ticket to the backend to get the real token
        const res = await fetch(`${API_URL}/api/auth/github/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket }),
        })

        if (!res.ok) {
            const error = await res.json().catch(() => ({}))
            return NextResponse.json(
                { error: error.message || "Ticket exchange failed" },
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

        // Dynamically get the expiration from the token using the helper we created earlier
        const maxAge = getTokenMaxAge(data.access_token)

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge,
        }

        // Now the cookie is safely set on the Admin domain
        response.cookies.set("access_token", data.access_token, cookieOptions)
        response.cookies.set(
            "user",
            encodeURIComponent(JSON.stringify(data.user)),
            { ...cookieOptions, httpOnly: false }
        )

        return response
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}