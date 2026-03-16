import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        console.log("API_URL:", API_URL);
        console.log("Login body:", body);

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const text = await response.text();

        console.log("Backend response status:", response.status);
        console.log("Backend response body:", text);

        return new NextResponse(text, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error) {
        console.error("LOGIN ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Proxy login failed", details: String(error) },
            { status: 500 }
        );
    }
}