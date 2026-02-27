import { Suspense } from "react"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import {
  getDashboardStats,
  getRevenueChart,
  getRecentOrders,
  getRecentCustomers,
  getLowStockProducts,
  getLatestReviews,
} from "@/features/queries/dashboard.queries"
import { RevenueChart } from "@/features/components/charts/revenue-chart"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) return null
  const positive = change >= 0
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(change).toFixed(1)}% vs last period
    </span>
  )
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  )
}

// ------------------------------------------------------------------
// Page — RSC: fetch everything in parallel at the top
// ------------------------------------------------------------------

export default async function DashboardPage() {
  const [stats, chartData, recentOrders, recentCustomers, lowStock, latestReviews] =
    await Promise.all([
      getDashboardStats(),
      getRevenueChart(),
      getRecentOrders(),
      getRecentCustomers(),
      getLowStockProducts(),
      getLatestReviews(),
    ])

  const statCards = [
    {
      name: "Total Revenue",
      value: formatCurrency(stats.revenue.value),
      change: stats.revenue.change,
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      name: "Active Orders",
      value: stats.orders.value.toLocaleString(),
      change: stats.orders.change,
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      name: "Active Products",
      value: stats.products.value.toLocaleString(),
      change: stats.products.change,
      icon: Package,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      name: "Customers",
      value: stats.customers.value.toLocaleString(),
      change: stats.customers.change,
      icon: Users,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Last 30 days overview</p>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
              <div className="mt-1">
                <ChangeIndicator change={stat.change} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Revenue & Orders</h2>
            <p className="text-sm text-slate-500">Daily breakdown for the last 30 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Orders
            </span>
          </div>
        </div>
        {/* Recharts must be a Client Component */}
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <RevenueChart data={chartData} />
        </Suspense>
      </div>

      {/* ── Bottom Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                    {order.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{order.user.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(Number(order.total))}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${ORDER_STATUS_STYLES[order.status] ?? "bg-slate-50 text-slate-600"
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Customers</h2>
            <Link href="/admin/customers" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentCustomers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No customers yet</p>
            ) : (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center gap-3 px-5 py-3">
                  {customer.image ? (
                    <Image
                      src={customer.image}
                      alt={customer.name ?? ""}
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                      {customer.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{customer.name}</p>
                    <p className="truncate text-xs text-slate-400">{customer.email}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {customer._count.orders} {customer._count.orders === 1 ? "order" : "orders"}
                  </span>
                </div>
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
            <Link href="/admin/products?status=active&sort=stock.asc" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">All products well stocked</p>
            ) : (
              lowStock.map((product) => (
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
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${product.stock === 0
                        ? "bg-red-50 text-red-600"
                        : product.stock <= 5
                          ? "bg-orange-50 text-orange-600"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                  >
                    {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Latest Reviews */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Latest Reviews</h2>
            <Link href="/admin/reviews" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {latestReviews.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No reviews yet</p>
            ) : (
              latestReviews.map((review) => (
                <div key={review.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                        {review.user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-900">{review.user.name}</p>
                        <Link
                          href={`/admin/products/${review.product.id}`}
                          className="truncate text-xs text-slate-400 hover:text-blue-600"
                        >
                          {review.product.name}
                        </Link>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-[11px] text-slate-400">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500 pl-9">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}