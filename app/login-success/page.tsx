// ecommerce-admin/app/login-success/page.tsx — simplified
"use client"
import { useEffect } from "react"

export default function LoginSuccessPage() {
    useEffect(() => {
        // Token is already set as a cookie by the backend — no URL parsing needed
        window.location.replace("/admin/dashboard")
    }, [])

    return (
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
            <p>Signing you in...</p>
        </div>
    )
}