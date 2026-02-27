import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl, auth: session } = req
    const isLoggedIn = !!session
    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isAuthRoute = nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register")

    // Redirect unauthenticated users away from admin routes
    if (isAdminRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // Block non-admin users even if authenticated
    if (isAdminRoute && isLoggedIn && session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // Redirect logged-in admins away from auth pages
    if (isAuthRoute && isLoggedIn && session.user.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}