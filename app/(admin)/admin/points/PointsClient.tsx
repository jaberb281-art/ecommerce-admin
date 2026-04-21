"use client"

import { useState, useCallback } from "react"
import { Coins, TrendingUp, Gift, Search, ChevronDown, ChevronUp, Plus, Minus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserPoints {
    id: string
    name: string | null
    email: string
    pointsBalance: number
    orderCount: number
}

interface Transaction {
    id: string
    points: number
    type: string
    description: string | null
    createdAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TX_COLORS: Record<string, string> = {
    PURCHASE: "text-emerald-600 bg-emerald-50",
    ORDER_MILESTONE: "text-purple-600 bg-purple-50",
    CHALLENGE_REWARD: "text-blue-600 bg-blue-50",
    SOCIAL_CONNECT: "text-pink-600 bg-pink-50",
    REDEMPTION: "text-red-600 bg-red-50",
    MANUAL: "text-amber-600 bg-amber-50",
}

const TX_LABELS: Record<string, string> = {
    PURCHASE: "Purchase", ORDER_MILESTONE: "Milestone",
    CHALLENGE_REWARD: "Challenge", SOCIAL_CONNECT: "Social",
    REDEMPTION: "Redeemed", MANUAL: "Manual",
}

// ── Server action wrappers (replaces the old js-cookie / axios pattern) ───────

async function fetchPointHistory(userId: string): Promise<Transaction[]> {
    const res = await fetch(`/api/proxy/points/user/${userId}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    return data.transactions ?? []
}

async function postAdjustPoints(userId: string, points: number, description: string): Promise<void> {
    const res = await fetch(`/api/proxy/points/user/${userId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, description }),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any
        throw new Error(body?.message ?? `Error ${res.status}`)
    }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PointsClient({
    initialUsers,
    initialError,
}: {
    initialUsers: UserPoints[]
    initialError: string | null
}) {
    const [users, setUsers] = useState<UserPoints[]>(initialUsers)
    const [search, setSearch] = useState("")
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [detailMap, setDetailMap] = useState<Record<string, Transaction[]>>({})
    const [detailLoading, setDetailLoading] = useState<string | null>(null)
    const [adjustUser, setAdjustUser] = useState<UserPoints | null>(null)
    const [adjustPoints, setAdjustPoints] = useState("")
    const [adjustReason, setAdjustReason] = useState("")
    const [adjusting, setAdjusting] = useState(false)

    const filtered = search
        ? users.filter(u =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
        : users

    const totalPoints = users.reduce((s, u) => s + u.pointsBalance, 0)
    const usersWithPoints = users.filter(u => u.pointsBalance > 0).length

    // ── Expand history ────────────────────────────────────────────────────────

    async function toggleExpand(userId: string) {
        if (expandedId === userId) { setExpandedId(null); return }
        setExpandedId(userId)
        if (detailMap[userId]) return
        setDetailLoading(userId)
        try {
            const transactions = await fetchPointHistory(userId)
            setDetailMap(prev => ({ ...prev, [userId]: transactions }))
        } catch (err: any) {
            toast.error("Failed to load history: " + err.message)
        } finally {
            setDetailLoading(null)
        }
    }

    // ── Adjust points ─────────────────────────────────────────────────────────

    async function handleAdjust() {
        if (!adjustUser) return
        const pts = parseInt(adjustPoints)
        if (isNaN(pts) || pts === 0) { toast.error("Enter a non-zero number"); return }
        if (!adjustReason.trim()) { toast.error("Reason is required"); return }
        setAdjusting(true)
        try {
            await postAdjustPoints(adjustUser.id, pts, adjustReason.trim())
            toast.success(`${pts > 0 ? "+" : ""}${pts} pts applied to ${adjustUser.name ?? adjustUser.email}`)
            setUsers(prev => prev.map(u =>
                u.id === adjustUser.id
                    ? { ...u, pointsBalance: u.pointsBalance + pts }
                    : u
            ))
            // Invalidate cached history so the next expand re-fetches
            setDetailMap(prev => { const n = { ...prev }; delete n[adjustUser.id]; return n })
            setAdjustUser(null)
            setAdjustPoints("")
            setAdjustReason("")
        } catch (err: any) {
            toast.error(err.message ?? "Failed to adjust points")
        } finally {
            setAdjusting(false)
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Points Management</h1>
                <p className="text-sm text-slate-500 mt-1">View balances, transaction history, and adjust points manually</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: <Coins className="h-5 w-5 text-amber-500" />, bg: "bg-amber-50", label: "Total Points in Circulation", value: totalPoints.toLocaleString() },
                    { icon: <TrendingUp className="h-5 w-5 text-emerald-500" />, bg: "bg-emerald-50", label: "Users with Points", value: usersWithPoints },
                    { icon: <Gift className="h-5 w-5 text-purple-500" />, bg: "bg-purple-50", label: "Rate", value: "10 pts / BD 1" },
                ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-lg ${s.bg} p-2`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {initialError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span><strong>Error loading users:</strong> {initialError}</span>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">User</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Orders</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Points Balance</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No users found</td></tr>
                        ) : filtered.map(user => (
                            <>
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                                                {user.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.name ?? "—"}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{user.orderCount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold text-base ${user.pointsBalance > 0 ? "text-amber-600" : "text-slate-400"}`}>
                                            {user.pointsBalance.toLocaleString()} pts
                                        </span>
                                        {user.pointsBalance >= 100 && (
                                            <span className="ml-2 text-xs text-slate-400">
                                                = BD {(user.pointsBalance / 100).toFixed(3)} value
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setAdjustUser(user)}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                                Adjust
                                            </button>
                                            <button onClick={() => toggleExpand(user.id)}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1">
                                                History
                                                {expandedId === user.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === user.id && (
                                    <tr key={`${user.id}-detail`}>
                                        <td colSpan={4} className="bg-slate-50 px-6 py-4">
                                            {detailLoading === user.id ? (
                                                <p className="text-sm text-slate-400">Loading history...</p>
                                            ) : !detailMap[user.id] || detailMap[user.id].length === 0 ? (
                                                <p className="text-sm text-slate-400">No transactions yet.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                                        Last {detailMap[user.id].length} transactions
                                                    </p>
                                                    {detailMap[user.id].map(tx => (
                                                        <div key={tx.id} className="flex items-center gap-3 rounded-lg bg-white border border-slate-100 px-4 py-2.5">
                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${TX_COLORS[tx.type] ?? "text-slate-600 bg-slate-100"}`}>
                                                                {TX_LABELS[tx.type] ?? tx.type}
                                                            </span>
                                                            <p className="flex-1 text-sm text-slate-600">{tx.description ?? "—"}</p>
                                                            <span className={`text-sm font-bold shrink-0 ${tx.points > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                                {tx.points > 0 ? "+" : ""}{tx.points} pts
                                                            </span>
                                                            <span className="text-xs text-slate-400 shrink-0">
                                                                {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Adjust Modal */}
            {adjustUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Adjust Points</h2>
                        <p className="text-sm text-slate-500 mb-5">
                            {adjustUser.name ?? adjustUser.email} · current balance:{" "}
                            <span className="font-semibold text-amber-600">{adjustUser.pointsBalance} pts</span>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-700 mb-1 block">Points (positive to add, negative to deduct)</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setAdjustPoints(v => String((parseInt(v) || 0) - 50))}
                                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><Minus className="h-4 w-4 text-slate-500" /></button>
                                    <input type="number" value={adjustPoints} onChange={e => setAdjustPoints(e.target.value)}
                                        placeholder="e.g. 100 or -50"
                                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                                    <button type="button" onClick={() => setAdjustPoints(v => String((parseInt(v) || 0) + 50))}
                                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><Plus className="h-4 w-4 text-slate-500" /></button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700 mb-1 block">Reason (shown in user history)</label>
                                <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                                    placeholder="e.g. Apology for delayed order"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                            </div>
                            {adjustPoints && !isNaN(parseInt(adjustPoints)) && (
                                <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm">
                                    New balance: <span className="font-bold text-slate-900">{adjustUser.pointsBalance + (parseInt(adjustPoints) || 0)} pts</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setAdjustUser(null); setAdjustPoints(""); setAdjustReason("") }}
                                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleAdjust} disabled={adjusting}
                                className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                                {adjusting ? "Saving..." : "Apply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}