import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { DeleteCouponButton } from "@/features/coupons/components/delete-coupon-button"
import { backendJSON } from "@/lib/backend"

export const dynamic = "force-dynamic"

async function getCoupons() {
    try {
        return await backendJSON<any[]>("/coupons")
    } catch {
        return []
    }
}

export default async function CouponsPage() {
    const coupons = await getCoupons()

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage discount coupon codes</p>
                </div>
                <Link
                    href="/admin/coupons/new"
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Coupon
                </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Code</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Discount</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Min Order</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Uses</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Expires</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                    No coupons yet
                                </td>
                            </tr>
                        ) : (
                            coupons.map((coupon: any) => (
                                <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-mono font-bold text-slate-900">{coupon.code}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {coupon.discountType === "PERCENTAGE"
                                            ? `${coupon.discountValue}%`
                                            : `$${coupon.discountValue}`}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {coupon.minOrderValue ? `$${coupon.minOrderValue}` : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${coupon.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/coupons/${coupon.id}`}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <DeleteCouponButton id={coupon.id} code={coupon.code} />
                                        </div>
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