import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        )

        const data = await res.json()

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.message || "Login failed" },
                { status: res.status }
            )
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error("Login API error:", error)

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}