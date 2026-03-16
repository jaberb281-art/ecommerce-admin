// app/(admin)/admin/orders/page.tsx
import { cookies } from "next/headers"
import axios from "axios"
import { format } from "date-fns"
import { OrderStatusSelect } from "@/features/orders/components/order-status-select"
import { OrderDetailDrawer } from "@/features/orders/components/order-detail-drawer"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export const dynamic = "force-dynamic"

async function getOrders() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
        const { data } = await axios.get(`${API_URL}/orders/admin/all?limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data.data ?? []
    } catch {
        return []
    }
}

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700",
    PROCESSING: "bg-orange-50 text-orange-700",
    SHIPPED: "bg-blue-50 text-blue-700",
    DELIVERED: "bg-indigo-50 text-indigo-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
}

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                <p className="text-sm text-slate-500 mt-1">Manage customer orders</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Order ID</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Items</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                    No orders yet
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{order.user?.name ?? "—"}</div>
                                        <div className="text-xs text-slate-400">{order.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        ${Number(order.total).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <OrderStatusSelect
                                            orderId={order.id}
                                            currentStatus={order.status}
                                            statusStyles={STATUS_STYLES}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <OrderDetailDrawer order={order} statusStyles={STATUS_STYLES} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}