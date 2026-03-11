"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { updateCategory, uploadCategoryImage } from "@/features/categories/actions/category.actions"

export default function EditCategoryPage() {
    const [name, setName] = useState("")
    const [image, setImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    useEffect(() => {
        fetch(`/api/categories/${id}`)
            .then(res => res.json())
            .then(data => {
                setName(data.name ?? "")
                setImage(data.image ?? null)
                setFetching(false)
            })
            .catch(() => setFetching(false))
    }, [id])

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadCategoryImage(formData)

            if ("error" in result) {
                setError(result.error)
                return
            }

            setImage(result.url)
        } catch {
            setError("Failed to upload image.")
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        setError("")
        try {
            await updateCategory(id, name.trim(), image ?? undefined)
            router.push("/admin/categories")
            router.refresh()
        } catch {
            setError("Failed to update category.")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-6 text-sm text-slate-500">Loading...</div>

    const isDisabled = loading || isUploading

    return (
        <div className="space-y-6 p-6 max-w-md">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Edit Category</h1>
                <p className="text-sm text-slate-500 mt-1">Update category details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Name */}
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

                {/* Image upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category Image
                        <span className="ml-1 text-slate-400 font-normal">(optional)</span>
                    </label>

                    <div className="space-y-3">
                        {/* Current image preview */}
                        {image && (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                                <Image
                                    src={image}
                                    alt="Category"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setImage(null)}
                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {/* Upload button — same style as product form */}
                        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 hover:bg-slate-50 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            ) : (
                                <ImagePlus className="h-5 w-5 text-slate-400" />
                            )}
                            <span className="text-sm text-slate-500">
                                {isUploading ? "Uploading..." : image ? "Replace image" : "Click to upload image"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={isDisabled}
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