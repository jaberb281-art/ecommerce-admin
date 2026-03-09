"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteCategory } from "@/features/categories/actions/category.actions"

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setLoading(true)
        await deleteCategory(id)
        router.refresh()
        setLoading(false)
        setConfirming(false)
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Delete "{name}"?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                    {loading ? "Deleting..." : "Yes"}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="text-xs font-medium text-slate-500 hover:underline"
                >
                    No
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    )
}