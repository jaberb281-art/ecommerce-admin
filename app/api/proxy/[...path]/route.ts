import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Allowlist of backend path prefixes the admin proxy is permitted to forward.
// Any request whose path does not start with one of these is rejected outright.
const ALLOWED_PROXY_PREFIXES = [
    '/mail',
    '/shop-settings',
    '/orders',
    '/products',
    '/categories',
    '/users',
    '/analytics',
    '/badges',
    '/coupons',
    '/events',
    '/points',
    '/notifications',
    '/addresses',
] as const;

async function handler(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    // Strip /api/proxy prefix — backend already has /api global prefix
    const path = req.nextUrl.pathname.replace('/api/proxy', '');

    // Block any path not explicitly in the allowlist
    const isAllowed = ALLOWED_PROXY_PREFIXES.some((prefix) => path.startsWith(prefix));
    if (!isAllowed) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const search = req.nextUrl.search;
    const API_URL = process.env.API_URL?.replace(/\/$/, '') ||
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
    const url = `${API_URL}/api${path}${search}`;

    const headers: HeadersInit = {};

    // Do NOT set Content-Type here — for multipart/form-data requests (e.g. image
    // uploads) the browser must set it with the boundary. Forwarding the original
    // Content-Type is the safest approach.
    const incomingContentType = req.headers.get("content-type");
    if (incomingContentType) {
        headers["Content-Type"] = incomingContentType;
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['Cookie'] = `token=${token}; access_token=${token}`;
    }

    const options: RequestInit = {
        method: req.method,
        headers,
        cache: 'no-store',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        // Forward the body as raw bytes via ArrayBuffer. Using await req.text()
        // would corrupt binary payloads (e.g. multipart/form-data with image
        // uploads) because it forces a UTF-8 string conversion. ArrayBuffer is
        // a clean pass-through for both JSON and binary.
        options.body = await req.arrayBuffer();
    }

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;