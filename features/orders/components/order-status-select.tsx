"use client"

import { useState, useTransition } from "react"
import { updateOrderStatus } from "@/features/orders/actions/order.actions"
import { toast } from "sonner"

const TRANSITIONS: Record<string, string[]> = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
}

export function OrderStatusSelect({
    orderId,
    currentStatus,
    statusStyles,
}: {
    orderId: string
    currentStatus: string
    statusStyles: Record<string, string>
}) {
    const [status, setStatus] = useState(currentStatus)
    const [isPending, startTransition] = useTransition()
    const allowed = TRANSITIONS[status] ?? []

    async function handleChange(newStatus: string) {
        if (!newStatus) return

        // Optimistically update the UI immediately — no blank flash
        const previousStatus = status
        setStatus(newStatus)

        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus)
            if (!result.success) {
                // Roll back on failure
                setStatus(previousStatus)
                toast.error(result.error ?? "Failed to update status")
            }
        })
    }

    if (allowed.length === 0) {
        return (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status] ?? "bg-slate-100 text-slate-600"}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status] ?? "bg-slate-100 text-slate-600"}`}>
                {status}
            </span>
            <select
                disabled={isPending}
                value=""
                onChange={e => handleChange(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-40"
            >
                <option value="" disabled>
                    {isPending ? "Saving..." : "Update →"}
                </option>
                {allowed.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
    )
}