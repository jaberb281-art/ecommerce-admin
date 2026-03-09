"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCategory } from "@/features/categories/actions/category.actions"

export default function NewCategoryPage() {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        setError("")
        try {
            await createCategory(name.trim())
            router.push("/admin/categories")
            router.refresh()
        } catch {
            setError("Failed to create category.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-md">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Category</h1>
                <p className="text-sm text-slate-500 mt-1">Create a new product category</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Category Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Electronics"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Category"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}