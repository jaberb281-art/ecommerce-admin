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

            document.cookie = `access_token=${data.access_token}; Path=/; SameSite=Lax; Secure`
            document.cookie = `token=${data.access_token}; Path=/; SameSite=Lax; Secure`
            document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; Path=/; SameSite=Lax; Secure`

            window.location.replace("/admin/dashboard")

        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsPending(false)
        }
    }

    const handleGitHubLogin = () => {
        // We add /api here because your NestJS main.ts has setGlobalPrefix('api')
        window.location.href = `${API_URL}/api/auth/github`;
    }
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                <h1 className="text-3xl font-bold mb-2 text-center text-slate-900">Admin</h1>
                <p className="text-center text-slate-500 mb-8">Sign in to manage your store</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
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
                </form>

                {/* --- SEPARATOR --- */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">Or continue with</span>
                    </div>
                </div>

                {/* --- GITHUB BUTTON --- */}
                <button
                    onClick={handleGitHubLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" />
                    </svg>
                    GitHub
                </button>
            </div>
        </div>
    )
}