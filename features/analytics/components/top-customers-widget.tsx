"use client"

import { useEffect, useState } from "react"
import { Crown } from "lucide-react"

interface Customer {
    id: string
    name: string
    email: string
    totalSpent: number
    totalOrders: number
}

export default function TopCustomersWidget() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/analytics?period=monthly")
            .then(res => res.json())
            .then(data => {
                setCustomers(data.topCustomers ?? [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-semibold text-slate-900">Top Customers</h2>
                </div>
            </div>
            <div className="divide-y divide-slate-100">
                {loading ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">Loading...</p>
                ) : customers.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">No orders yet</p>
                ) : (
                    customers.map((customer, index) => (
                        <div key={customer.id} className="flex items-center gap-3 px-5 py-3">
                            <span className="w-5 text-xs font-bold text-slate-400">#{index + 1}</span>
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                                {customer.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">{customer.name}</p>
                                <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">${customer.totalSpent.toFixed(2)}</p>
                                <p className="text-xs text-slate-400">{customer.totalOrders} orders</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}