import { NextRequest, NextResponse } from "next/server"

function getTokenMaxAge(jwt: string): number {
    try {
        const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString())
        if (typeof payload.exp === "number") {
            return Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
        }
    } catch { }
    return 60 * 15
}

export async function POST(req: NextRequest) {
    try {
        const { ticket } = await req.json()

        if (!ticket || typeof ticket !== "string") {
            return NextResponse.json({ message: "Ticket is required" }, { status: 400 })
        }

        // Forward the ticket to the backend to exchange for a real JWT
        const API_URL = (process.env.API_URL ?? "").replace(/\/api\/?$/, "").replace(/\/$/, "")
        const res = await fetch(`${API_URL}/api/auth/github/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket }),
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return NextResponse.json(
                { message: body?.message ?? "Invalid or expired ticket" },
                { status: 401 }
            )
        }

        const data = await res.json()
        const accessToken: string = data.access_token

        if (!accessToken) {
            return NextResponse.json({ message: "No token received" }, { status: 500 })
        }

        const response = NextResponse.json({ success: true })
        const maxAge = getTokenMaxAge(accessToken)

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge,
        }

        response.cookies.set("access_token", accessToken, cookieOptions)
        return response

    } catch (err) {
        console.error("[github-exchange]", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}