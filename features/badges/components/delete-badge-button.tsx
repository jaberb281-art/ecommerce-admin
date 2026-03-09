"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteBadge } from "@/features/badges/actions/badge.actions"

export function DeleteBadgeButton({ id, name }: { id: string; name: string }) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setLoading(true)
        await deleteBadge(id)
        router.refresh()
        setLoading(false)
        setConfirming(false)
    }

    if (confirming) {
        return (
            <div className="flex flex-col gap-1">
                <button onClick={handleDelete} disabled={loading} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
                    {loading ? "..." : "Yes"}
                </button>
                <button onClick={() => setConfirming(false)} className="text-xs font-medium text-slate-500 hover:underline">
                    No
                </button>
            </div>
        )
    }

    return (
        <button onClick={() => setConfirming(true)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
        </button>
    )
}