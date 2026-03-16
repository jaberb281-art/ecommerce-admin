import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Swapped to NEXT_PUBLIC_API_URL to match your Railway Variables screenshot
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Ensure this path matches your backend (add /api/ if you have a global prefix)
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.message || "Invalid credentials" },
                { status: res.status || 401 }
            );
        }

        const setCookieHeaders = res.headers.getSetCookie();
        const tokenCookie = setCookieHeaders.find(c => c.includes("token="));
        const tokenMatch = tokenCookie?.match(/token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (!token) {
            return NextResponse.json({ error: "No token received from backend" }, { status: 500 });
        }

        const response = NextResponse.json({ success: true, user: data.user });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        };

        response.cookies.set("access_token", token, cookieOptions);
        response.cookies.set("token", token, cookieOptions);
        response.cookies.set("user", JSON.stringify(data.user), {
            ...cookieOptions,
            httpOnly: false,
        });

        revalidatePath("/admin", "layout");
        revalidatePath("/admin/dashboard");

        return response;
    } catch (err) {
        console.error("[login route error]", err);
        return NextResponse.json(
            { error: "Connection to backend failed." },
            { status: 500 }
        );
    }
}