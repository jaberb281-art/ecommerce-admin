import Image from "next/image"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { getLowStockProducts, getRecentProducts } from "@/features/products/queries/dashboard.queries"
import DashboardStats from "@/features/products/components/dashboard-stats"
import BestSellersWidget from "@/features/products/components/best-sellers-widget"
import TopCustomersWidget from "@/features/analytics/components/top-customers-widget"

export const dynamic = "force-dynamic"

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date))
}

export default async function DashboardPage() {
    const [lowStock, recentProducts] = await Promise.all([
        getLowStockProducts(),
        getRecentProducts(),
    ])

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Overview</p>
            </div>

            <DashboardStats />

            {/* Row 1 — Recent Products, Low Stock, Best Sellers */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Recent Products */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-slate-900">Recent Products</h2>
                        <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentProducts.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">No products yet</p>
                        ) : (
                            recentProducts.map((product: any) => (
                                <Link
                                    key={product.id}
                                    href={`/admin/products/${product.id}`}
                                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                                >
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
                                    <span className="text-xs text-slate-400">
                                        {formatDate(product.createdAt)}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <h2 className="text-sm font-semibold text-slate-900">Low Stock Alerts</h2>
                        </div>
                        <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {lowStock.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">
                                All products well stocked
                            </p>
                        ) : (
                            lowStock.map((product: any) => (
                                <Link
                                    key={product.id}
                                    href={`/admin/products/${product.id}`}
                                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                                        <p className="text-xs text-slate-400">{product.category?.name}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${product.stock === 0
                                            ? "bg-red-50 text-red-600"
                                            : product.stock <= 5
                                                ? "bg-orange-50 text-orange-600"
                                                : "bg-yellow-50 text-yellow-700"
                                        }`}>
                                        {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Best Sellers */}
                <BestSellersWidget />

            </div>

            {/* Row 2 — Top Customers */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                <TopCustomersWidget />
            </div>

        </div>
    )
}