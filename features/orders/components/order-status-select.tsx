"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateOrderStatus } from "@/features/orders/actions/order.actions"

const TRANSITIONS: Record<string, string[]> = {
    PENDING: ["PROCESSING", "SHIPPED", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "COMPLETED"],
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
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState("") // ✅ controlled value
    const router = useRouter()
    const allowed = TRANSITIONS[status] ?? []

    async function handleChange(newStatus: string) {
        if (!newStatus) return
        setLoading(true)
        await updateOrderStatus(orderId, newStatus)
        setStatus(newStatus)
        setSelected("") // ✅ reset dropdown after update
        router.refresh()
        setLoading(false)
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
                disabled={loading}
                value={selected} // ✅ controlled
                onChange={e => handleChange(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
            >
                <option value="" disabled>Update</option>
                {allowed.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
    )
}