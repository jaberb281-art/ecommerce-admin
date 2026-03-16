import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    // 1. Use the EXACT variable name from your Railway dashboard
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
        const { email, password } = await req.json();

        // Safety check to ensure the variable is actually being read
        if (!API_URL) {
            console.error("[login route error]: NEXT_PUBLIC_API_URL is undefined in Railway");
            return NextResponse.json(
                { error: "Server configuration error." },
                { status: 500 }
            );
        }

        // 2. Point to the backend with the global /api prefix
        const backendEndpoint = `${API_URL}/api/auth/login`;
        console.log(`[login attempt]: Fetching from ${backendEndpoint}`);

        const res = await fetch(backendEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            cache: 'no-store'
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.message || "Invalid credentials" },
                { status: res.status || 401 }
            );
        }

        // 3. Extract the session token
        const setCookieHeaders = res.headers.getSetCookie();
        const tokenCookie = setCookieHeaders.find(c => c.includes("token="));
        const tokenMatch = tokenCookie?.match(/token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (!token) {
            console.error("[login error]: Backend did not return a token");
            return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
        }

        const response = NextResponse.json({ success: true, user: data.user });

        // 4. Set cookies for the admin domain
        const cookieOptions = {
            httpOnly: true,
            secure: true, // Always true for Railway production
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
        console.error("[login route error]:", err);
        return NextResponse.json(
            { error: "Could not connect to the backend server." },
            { status: 500 }
        );
    }
}