// lib/api.ts — central server-side fetch utility
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function serverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // 1. Guard: If no token, bounce to login
  if (!token) redirect('/admin/login');

  // 2. Build Clean URL: Prevent URL joining errors (e.g., ...appapi/login)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;

  // 3. Execute Fetch
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Pass the token in the Authorization header (NestJS standard) 
      // AND as a cookie if your backend specifically requires it
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    cache: 'no-store',
  });

  // 4. Handle Unauthorized
  if (res.status === 401) {
    redirect('/admin/login');
  }

  // 5. Handle Errors
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown Error');
    throw new Error(`API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}