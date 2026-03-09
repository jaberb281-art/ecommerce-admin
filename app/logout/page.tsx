"use client"

import { useEffect } from "react"

export default function LogoutPage() {
    useEffect(() => {
        fetch("/api/logout", { method: "POST" }).finally(() => {
            window.location.replace("/login")
        })
    }, [])

    return null
}