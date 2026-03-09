"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { updateCategory } from "@/features/categories/actions/category.actions"

export default function EditCategoryPage() {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    useEffect(() => {
        fetch(`/api/categories/${id}`)
            .then(res => res.json())
            .then(data => {
                setName(data.name)
                setFetching(false)
            })
            .catch(() => setFetching(false))
    }, [id])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        setError("")
        try {
            await updateCategory(id, name.trim())
            router.push("/admin/categories")
            router.refresh()
        } catch {
            setError("Failed to update category.")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-6 text-sm text-slate-500">Loading...</div>

    return (
        <div className="space-y-6 p-6 max-w-md">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Edit Category</h1>
                <p className="text-sm text-slate-500 mt-1">Update category name</p>
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
                        {loading ? "Saving..." : "Save Changes"}
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