"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const API_URL =
    (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "")

export default function LoginSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get("token")

        if (!token) {
            router.replace("/login")
            return
        }

        // Set the same cookies as the normal login flow
        document.cookie = `access_token=${token}; Path=/; SameSite=Lax; Secure`
        document.cookie = `token=${token}; Path=/; SameSite=Lax; Secure`

        // Fetch user info so we can set the user cookie too
        fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((user) => {
                if (user?.id) {
                    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; Path=/; SameSite=Lax; Secure`
                }
            })
            .catch(() => {
                // Non-fatal — user cookie is optional, token is enough
            })
            .finally(() => {
                window.location.replace("/admin/dashboard")
            })
    }, [searchParams, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Signing you in...</p>
            </div>
        </div>
    )
}