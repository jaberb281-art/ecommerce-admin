"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCoupon } from "@/features/coupons/actions/coupon.actions"

export default function NewCouponPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const [form, setForm] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderValue: "",
        maxUses: "",
        expiresAt: "",
        isActive: true,
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value, type } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            await createCoupon({
                code: form.code,
                discountType: form.discountType,
                discountValue: parseFloat(form.discountValue),
                minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined,
                maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
                expiresAt: form.expiresAt || undefined,
                isActive: form.isActive,
            })
            router.push("/admin/coupons")
            router.refresh()
        } catch {
            setError("Failed to create coupon.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Coupon</h1>
                <p className="text-sm text-slate-500 mt-1">Create a new discount coupon</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code</label>
                        <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SAVE20" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-black" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
                        <select name="discountType" value={form.discountType} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount ($)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Discount Value {form.discountType === "PERCENTAGE" ? "(%)" : "($)"}
                        </label>
                        <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} placeholder="e.g. 20" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Min Order Value ($)</label>
                        <input name="minOrderValue" type="number" value={form.minOrderValue} onChange={handleChange} placeholder="Optional" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses</label>
                        <input name="maxUses" type="number" value={form.maxUses} onChange={handleChange} placeholder="Optional" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                        <input name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                        <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300" />
                        <label className="text-sm font-medium text-slate-700">Active</label>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50">
                        {loading ? "Creating..." : "Create Coupon"}
                    </button>
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}