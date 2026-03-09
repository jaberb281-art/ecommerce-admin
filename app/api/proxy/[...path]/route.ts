import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const path = req.nextUrl.pathname.replace('/api/proxy', '');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        headers: { Cookie: `token=${token}` },
        cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}