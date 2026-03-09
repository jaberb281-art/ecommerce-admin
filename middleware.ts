import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
    const allCookies = req.cookies.getAll()
    const tokenCookie = allCookies.find(c => c.name === "access_token")
    const token = tokenCookie?.value
    const { pathname } = req.nextUrl

    if (pathname.startsWith("/admin") && !token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}