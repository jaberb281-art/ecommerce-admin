import { Crown } from "lucide-react"
import { backendJSON } from "@/lib/backend"

export const dynamic = "force-dynamic"

async function getTopCustomers() {
    try {
        return await backendJSON<any[]>("/analytics/top-customers?limit=50")
    } catch {
        return []
    }
}

export default async function CustomersPage() {
    const customers = await getTopCustomers()

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-sm text-slate-500 mt-1">Top customers ranked by total spending</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">{customers.length} customers</span>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Rank</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Total Orders</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Total Spent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                    No customers yet
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer: any, index: number) => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`font-bold ${index === 0 ? "text-amber-500" :
                                            index === 1 ? "text-slate-400" :
                                                index === 2 ? "text-orange-400" :
                                                    "text-slate-300"
                                            }`}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 shrink-0">
                                                {customer.name?.[0]?.toUpperCase() ?? "U"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{customer.name}</p>
                                                <p className="text-xs text-slate-400">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{customer.totalOrders}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-emerald-600">
                                            ${customer.totalSpent.toFixed(2)}
                                        </span>
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