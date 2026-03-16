import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    // Move inside the function to ensure it reads the latest environment state
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
        const { email, password } = await req.json();

        if (!API_URL) {
            console.error("[login route error]: NEXT_PUBLIC_API_URL is undefined");
            return NextResponse.json(
                { error: "Server configuration error. Please check environment variables." },
                { status: 500 }
            );
        }

        // We include /api/ because your NestJS backend uses a global prefix
        const backendEndpoint = `${API_URL}/api/auth/login`;
        console.log(`[login attempt]: Fetching from ${backendEndpoint}`);

        const res = await fetch(backendEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            cache: 'no-store' // Ensure no stale responses
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
            console.error("[login route error]: Backend did not return a token cookie");
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

        // Set auth cookies
        response.cookies.set("access_token", token, cookieOptions);
        response.cookies.set("token", token, cookieOptions);
        response.cookies.set("user", JSON.stringify(data.user), {
            ...cookieOptions,
            httpOnly: false,
        });

        // Clear Next.js cache for admin pages
        revalidatePath("/admin", "layout");
        revalidatePath("/admin/dashboard");

        return response;
    } catch (err) {
        console.error("[login route error]:", err);
        return NextResponse.json(
            { error: "Could not connect to the backend server." },
            { status: 500 }
        );
    }
}