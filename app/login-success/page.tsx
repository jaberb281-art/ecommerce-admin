// ecommerce-admin/app/login-success/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginSuccessInner() {
    const searchParams = useSearchParams()
    const [error, setError] = useState("")

    useEffect(() => {
        const ticket = searchParams.get("ticket")
        if (!ticket) {
            setError("No ticket received. Please try logging in again.")
            return
        }

        // Exchange the one-time ticket for a real JWT cookie on this domain
        fetch("/api/auth/github-exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    throw new Error(body?.message ?? "Exchange failed")
                }
                window.location.replace("/admin/dashboard")
            })
            .catch((err) => {
                console.error("[login-success]", err)
                setError("Sign-in failed. Please try again.")
            })
    }, [searchParams])

    if (error) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
                <p style={{ color: "red" }}>{error}</p>
                <a href="/login" style={{ textDecoration: "underline" }}>Back to login</a>
            </div>
        )
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
            <p>Signing you in...</p>
        </div>
    )
}

export default function LoginSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
                <p>Signing you in...</p>
            </div>
        }>
            <LoginSuccessInner />
        </Suspense>
    )
}