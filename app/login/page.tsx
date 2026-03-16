"use client"

import { useState } from "react"

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "")

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isPending, setIsPending] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            setError("Please enter your email and password.")
            return
        }

        setError("")
        setIsPending(true)

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data?.message || "Invalid email or password.")
                return
            }

            // save JWT token
            localStorage.setItem("token", data.access_token)

            // redirect to dashboard
            window.location.replace("/admin/dashboard")

        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-200"
            >
                <h1 className="text-3xl font-bold mb-2 text-center text-slate-900">Admin</h1>
                <p className="text-center text-slate-500 mb-8">Sign in to manage your store</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-slate-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isPending ? "Signing in..." : "Sign In"}
                    </button>
                </div>
            </form>
        </div>
    )
}