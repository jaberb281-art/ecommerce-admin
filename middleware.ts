import { NextRequest, NextResponse } from "next/server"

function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
    try {
        const base64Payload = token.split(".")[1]
        if (!base64Payload) return null
        const decoded = Buffer.from(base64Payload, "base64url").toString("utf-8")
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

export function middleware(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value
    const { pathname } = req.nextUrl

    if (!pathname.startsWith("/admin")) return NextResponse.next()

    // No token at all → redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    const payload = decodeJwtPayload(token)

    // Token is malformed or expired → redirect to login
    if (!payload) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Not an admin → redirect to login (or a /forbidden page)
    if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login?error=forbidden", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}