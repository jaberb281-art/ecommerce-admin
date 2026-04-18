import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('access_token')?.value;

    // Strip /api/proxy prefix — backend already has /api global prefix
    const path = req.nextUrl.pathname.replace('/api/proxy', '');
    const search = req.nextUrl.search;
    const API_URL = process.env.API_URL?.replace(/\/$/, '') ||
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
    const url = `${API_URL}/api${path}${search}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

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
        options.body = await req.text();
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