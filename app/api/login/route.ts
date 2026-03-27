import { NextRequest, NextResponse } from "next/server"

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "")

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
            return NextResponse.json(
                { message: data?.message || "Invalid email or password." },
                { status: res.status }
            )
        }

        if (!data?.access_token) {
            return NextResponse.json(
                { message: "Login response did not include an access token." },
                { status: 502 }
            )
        }

        const response = NextResponse.json({ success: true })
        const secure = process.env.NODE_ENV === "production"
        const cookieOptions = {
            httpOnly: true,
            secure,
            sameSite: "lax" as const,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        }

        response.cookies.set("access_token", data.access_token, cookieOptions)
        response.cookies.set("token", data.access_token, cookieOptions)
        response.cookies.set(
            "user",
            encodeURIComponent(JSON.stringify(data.user ?? null)),
            cookieOptions
        )

        return response
    } catch {
        return NextResponse.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
