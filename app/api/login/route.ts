import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.message || "Invalid credentials" },
                { status: 401 }
            );
        }

        // Use getSetCookie() to properly handle headers from NestJS
        const setCookieHeaders = res.headers.getSetCookie();
        const tokenCookie = setCookieHeaders.find(c => c.includes("token="));
        const tokenMatch = tokenCookie?.match(/token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (!token) {
            return NextResponse.json({ error: "No token received from backend" }, { status: 500 });
        }

        // 1. Prepare the redirect response
        const response = NextResponse.redirect(new URL("/admin/dashboard", req.url));

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        };

        // 2. Set the cookies on the redirect response
        response.cookies.set("access_token", token, cookieOptions);
        response.cookies.set("token", token, cookieOptions);
        response.cookies.set("user", JSON.stringify(data.user), {
            ...cookieOptions,
            httpOnly: false, // Accessible by client-side if needed
        });

        // 3. CRITICAL: BUST THE CACHE
        // This tells Next.js that any server-side data for the admin section is now invalid
        revalidatePath("/admin", "layout");
        revalidatePath("/admin/dashboard");

        return response;
    } catch (err) {
        console.error("[login route error]", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}