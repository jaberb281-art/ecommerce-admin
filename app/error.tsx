"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    const router = useRouter()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-slate-200">500</h1>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">Something went wrong</h2>
                <p className="mt-2 text-sm text-slate-500">
                    {error.message || "An unexpected error occurred."}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => router.push("/admin")}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}