import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// ------------------------------------------------------------------
// Login validation schema
// ------------------------------------------------------------------

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
})

// ------------------------------------------------------------------
// Auth.js config
// ------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        // ── Google OAuth ──────────────────────────────────────────────
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // ── Credentials (email + password) ───────────────────────────
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) return null

                const user = await db.user.findUnique({
                    where: { email: parsed.data.email },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                        passwordHash: true,
                    },
                })

                // Only allow admin role through the admin dashboard
                if (!user || user.role !== "admin") return null

                // Block credential login if account was created via OAuth
                // (no password set)
                if (!user.passwordHash) return null

                const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
                if (!valid) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                }
            },
        }),
    ],

    callbacks: {
        // ── JWT — persist role into the token ─────────────────────────
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }

            // For OAuth sign-ins, fetch role from DB since it's not on
            // the OAuth profile by default
            if (account?.provider === "google" && token.email) {
                const dbUser = await db.user.findUnique({
                    where: { email: token.email },
                    select: { id: true, role: true },
                })
                if (dbUser) {
                    token.id = dbUser.id
                    token.role = dbUser.role
                }
            }

            return token
        },

        // ── Session — expose role to the client ───────────────────────
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },

        // ── Sign-in — block non-admin OAuth logins ────────────────────
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                if (!profile?.email) return false

                const user = await db.user.findUnique({
                    where: { email: profile.email },
                    select: { role: true },
                })

                // Only allow existing admin accounts via Google
                // Prevents any Google account from accessing the dashboard
                return user?.role === "admin"
            }

            // Credentials provider handles its own check in authorize()
            return true
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",    // redirect auth errors back to login
    },

    session: { strategy: "jwt" },
})