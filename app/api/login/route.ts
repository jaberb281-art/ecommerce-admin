import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
            console.error("NEXT_PUBLIC_API_URL is missing");
            return NextResponse.json(
                { error: "API URL not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // important for cookies
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data?.message || "Login failed" },
                { status: response.status }
            );
        }

        const res = NextResponse.json(data);

        // forward backend cookies to browser
        const cookies = response.headers.get("set-cookie");
        if (cookies) {
            res.headers.set("set-cookie", cookies);
        }

        return res;

    } catch (error) {
        console.error("LOGIN ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}