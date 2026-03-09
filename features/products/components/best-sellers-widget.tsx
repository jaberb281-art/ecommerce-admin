"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { TrendingUp } from "lucide-react"

interface BestSeller {
    id: string
    name: string
    images: string[]
    price: number
    unitsSold: number
    category?: { name: string }
}

export default function BestSellersWidget() {
    const [products, setProducts] = useState<BestSeller[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/best-sellers")
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-sm font-semibold text-slate-900">Best Sellers</h2>
                </div>
                <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">
                    View all
                </Link>
            </div>
            <div className="divide-y divide-slate-100">
                {loading ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">Loading...</p>
                ) : products.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">No sales data yet</p>
                ) : (
                    products.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/admin/products/${product.id}`}
                            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                        >
                            <span className="w-5 text-xs font-bold text-slate-400">#{index + 1}</span>
                            {product.images?.[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 shrink-0 rounded-lg border object-cover"
                                />
                            ) : (
                                <div className="h-9 w-9 shrink-0 rounded-lg border bg-slate-100" />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                                <p className="text-xs text-slate-400">{product.category?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">${product.price}</p>
                                <p className="text-xs text-emerald-600">{product.unitsSold} sold</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}