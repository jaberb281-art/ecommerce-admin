"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createBadge, uploadBadgeImage } from "@/features/badges/actions/badge.actions"

export default function NewBadgePage() {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const fileRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const [form, setForm] = useState({
        name: "",
        description: "",
        color: "#000000",
    })

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const fd = new FormData()
        fd.append("file", file)
        const result = await uploadBadgeImage(fd)
        if (result.url) setImageUrl(result.url)
        setUploading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.name.trim()) return
        setLoading(true)
        setError("")
        try {
            await createBadge({ ...form, imageUrl: imageUrl || undefined })
            router.push("/admin/badges")
            router.refresh()
        } catch {
            setError("Failed to create badge.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Badge</h1>
                <p className="text-sm text-slate-500 mt-1">Create a new badge to award to users</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

                {/* Badge Image */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Badge Image</label>
                    <div className="flex items-center gap-4">
                        {imageUrl ? (
                            <Image src={imageUrl} alt="Badge" width={64} height={64} className="h-16 w-16 rounded-full object-cover border-2 border-slate-200" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl border-2 border-dashed border-slate-300">
                                🏅
                            </div>
                        )}
                        <div>
                            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                {uploading ? "Uploading..." : "Upload Image"}
                            </button>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG recommended</p>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Badge Name</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. VIP Customer"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="e.g. Awarded to our most valued customers"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Badge Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={form.color}
                            onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                            className="h-9 w-16 rounded border border-slate-300 cursor-pointer"
                        />
                        <span className="text-sm text-slate-500">{form.color}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={loading || uploading} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50">
                        {loading ? "Creating..." : "Create Badge"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}