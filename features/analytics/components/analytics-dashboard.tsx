"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

type Period = "daily" | "weekly" | "monthly"

interface AnalyticsData {
    revenue: { label: string; value: number }[]
    orders: { label: string; value: number }[]
    topProducts: { id: string; name: string; image: string | null; unitsSold: number; revenue: number }[]
    topCustomers: { id: string; name: string; email: string; totalSpent: number; totalOrders: number }[]
    newCustomers: { label: string; value: number }[]
}

const EMPTY_DATA: AnalyticsData = {
    revenue: [],
    orders: [],
    topProducts: [],
    topCustomers: [],
    newCustomers: [],
}

async function fetchAnalytics(period: Period): Promise<AnalyticsData> {
    const res = await fetch(`/api/analytics?period=${period}`)
    if (!res.ok) throw new Error(`Analytics fetch failed: ${res.status}`)
    const d = await res.json()
    return {
        revenue: d.revenue ?? [],
        orders: d.orders ?? [],
        topProducts: d.topProducts ?? [],
        topCustomers: d.topCustomers ?? [],
        newCustomers: d.newCustomers ?? [],
    }
}

export default function AnalyticsDashboard() {
    const [period, setPeriod] = useState<Period>("monthly")

    const { data = EMPTY_DATA, isLoading, isError } = useQuery({
        queryKey: ["analytics", period],
        queryFn: () => fetchAnalytics(period),
        staleTime: 2 * 60 * 1000, // keep fresh for 2 minutes
    })

    const periods: { label: string; value: Period }[] = [
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
    ]

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Track your store performance</p>
                </div>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                    {periods.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${period === p.value
                                ? "bg-black text-white"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Failed to load analytics. Please try refreshing the page.
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-sm text-slate-400">
                    Loading analytics...
                </div>
            ) : (
                <>
                    {/* Revenue Line Chart */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-6">Revenue Over Time</h2>
                        {data.revenue.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-12">No revenue data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart key={period} data={data.revenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
                                    <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: "#10b981", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Orders Bar Chart */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-6">Orders Over Time</h2>
                        {data.orders.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-12">No orders data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart key={period} data={data.orders}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip formatter={(v) => [Number(v), "Orders"]} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Top Products Table */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Top Selling Products</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Rank</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Units Sold</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.topProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                            No sales data yet
                                        </td>
                                    </tr>
                                ) : (
                                    data.topProducts.map((product, index) => (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            width={36}
                                                            height={36}
                                                            className="h-9 w-9 rounded-lg border object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-lg border bg-slate-100 shrink-0" />
                                                    )}
                                                    <span className="font-medium text-slate-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{product.unitsSold}</td>
                                            <td className="px-4 py-3 font-medium text-emerald-600">
                                                ${product.revenue.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* New Customers Chart */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-6">New Customers Over Time</h2>
                        {data.newCustomers.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-12">No customer data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart key={`customers-${period}`} data={data.newCustomers}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip formatter={(v) => [Number(v), "New Customers"]} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Top Customers Table */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Top Customers</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Rank</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Orders</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.topCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                            No customer data yet
                                        </td>
                                    </tr>
                                ) : (
                                    data.topCustomers.map((customer, index) => (
                                        <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                                                        {customer.name?.[0]?.toUpperCase() ?? "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{customer.name}</p>
                                                        <p className="text-xs text-slate-400">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{customer.totalOrders}</td>
                                            <td className="px-4 py-3 font-medium text-emerald-600">
                                                ${customer.totalSpent.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}