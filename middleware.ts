import { NextRequest, NextResponse } from "next/server"
import { jwtVerify, type JWTPayload } from "jose"

interface AdminJwtPayload extends JWTPayload {
    role?: string
}

async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        console.error("[middleware] JWT_SECRET is not set — cannot verify tokens")
        return null
    }

    try {
        const key = new TextEncoder().encode(secret)
        const { payload } = await jwtVerify<AdminJwtPayload>(token, key)
        return payload
    } catch {
        // Covers: invalid signature, expired token, malformed token
        return null
    }
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value
    const { pathname } = req.nextUrl

    if (!pathname.startsWith("/admin")) return NextResponse.next()

    // No token at all → redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Cryptographically verify the token — rejects forged or tampered tokens
    const payload = await verifyAdminToken(token)

    // Invalid signature, expired, or malformed → redirect to login
    if (!payload) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Not an admin → redirect to login with error
    if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login?error=forbidden", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}