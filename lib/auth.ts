import 'server-only'
import { cookies } from "next/headers"

// Single source of truth for the auth cookie name.
// The login route sets "access_token"; everything else reads it via this helper.
export const TOKEN_COOKIE = "access_token"

/**
 * Returns the current user's JWT from the HttpOnly cookie.
 * Use this in all server components, server actions, and route handlers.
 */
export async function getAccessToken(): Promise<string | undefined> {
    const store = await cookies()
    return store.get(TOKEN_COOKIE)?.value
}