// lib/api.ts — central server-side fetch utility
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function serverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/admin/login');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `token=${token}`,
      ...options.headers,
    },
    cache: 'no-store', // always fresh — never use default cache for auth'd requests
  });

  if (res.status === 401) redirect('/admin/login');

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}