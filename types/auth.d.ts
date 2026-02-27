import { DefaultSession } from "next-auth"

// ------------------------------------------------------------------
// Extend next-auth types so session.user.role and session.user.id
// are available without casting everywhere
// ------------------------------------------------------------------

declare module "next-auth" {
    interface User {
        role: string
    }

    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
    }
}