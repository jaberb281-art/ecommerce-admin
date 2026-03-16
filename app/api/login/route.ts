import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("Login body:", body);

        const response = await fetch(
            "https://ecommerce-backend-production-44ff.up.railway.app/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(body),
            }
        );

        const data = await response.text();

        console.log("Backend response status:", response.status);
        console.log("Backend response body:", data);

        const nextResponse = new NextResponse(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // forward auth cookie from backend
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextResponse.headers.set("set-cookie", setCookie);
        }

        return nextResponse;
    } catch (error) {
        console.error("LOGIN ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Proxy login failed", details: String(error) },
            { status: 500 }
        );
    }
}