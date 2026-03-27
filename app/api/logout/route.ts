import { NextResponse } from "next/server"

export async function POST() {
    const response = NextResponse.json({ success: true })
    const cookieOptions = { path: "/" }
    response.cookies.delete("access_token", cookieOptions)
    response.cookies.delete("token", cookieOptions)
    response.cookies.delete("user", cookieOptions)
    return response
}
