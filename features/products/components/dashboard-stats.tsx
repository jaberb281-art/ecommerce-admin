"use client"

import { useEffect, useState } from "react"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"

interface Stats {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalUsers: number
}

export default function DashboardStats() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const statCards = [
        {
            name: "Total Revenue",
            value: loading ? "..." : `$${stats?.totalRevenue?.toLocaleString() ?? 0}`,
            icon: DollarSign,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            name: "Total Orders",
            value: loading ? "..." : stats?.totalOrders?.toLocaleString() ?? 0,
            icon: ShoppingCart,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            name: "Total Products",
            value: loading ? "..." : stats?.totalProducts?.toLocaleString() ?? 0,
            icon: Package,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
        },
        {
            name: "Total Users",
            value: loading ? "..." : stats?.totalUsers?.toLocaleString() ?? 0,
            icon: Users,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600",
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
                <div
                    key={stat.name}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div className={`rounded-lg p-2 w-fit ${stat.iconBg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}