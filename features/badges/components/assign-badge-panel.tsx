"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { awardBadge, revokeBadge } from "@/features/badges/actions/badge.actions"

export function AssignBadgePanel({ badges, users }: { badges: any[]; users: any[] }) {
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [selectedBadge, setSelectedBadge] = useState("")
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState("")
    const router = useRouter()

    async function handleAward() {
        if (!selectedUser || !selectedBadge) return
        setLoading(true)
        setSuccess("")
        await awardBadge(selectedBadge, selectedUser.id, note || undefined)
        setSuccess(`Badge awarded to ${selectedUser.name}!`)
        setNote("")
        setSelectedBadge("")
        router.refresh()
        setLoading(false)
    }

    async function handleRevoke(badgeId: string, userId: string) {
        setLoading(true)
        await revokeBadge(badgeId, userId)
        router.refresh()
        setLoading(false)
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* User list */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">Select User</h2>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {users.map((user: any) => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 ${selectedUser?.id === user.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
                        >
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                                {user.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                            <span className="text-xs text-slate-400">{user.userBadges?.length ?? 0} badges</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Award panel */}
            <div className="space-y-4">
                {selectedUser ? (
                    <>
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-900">Award Badge to {selectedUser.name}</h2>

                            {success && (
                                <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Badge</label>
                                <select
                                    value={selectedBadge}
                                    onChange={e => setSelectedBadge(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="">Choose a badge...</option>
                                    {badges.map((badge: any) => (
                                        <option key={badge.id} value={badge.id}>{badge.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Note (optional)</label>
                                <input
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="e.g. Thank you for your loyalty!"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <button
                                onClick={handleAward}
                                disabled={loading || !selectedBadge}
                                className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Awarding..." : "🎖️ Award Badge"}
                            </button>
                        </div>

                        {/* Current badges */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-slate-900 mb-3">Current Badges</h2>
                            {selectedUser.userBadges?.length === 0 ? (
                                <p className="text-sm text-slate-400">No badges yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedUser.userBadges?.map((ub: any) => (
                                        <div key={ub.id} className="flex items-center gap-3">
                                            {ub.badge.imageUrl ? (
                                                <Image src={ub.badge.imageUrl} alt={ub.badge.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">🏅</div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">{ub.badge.name}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRevoke(ub.badge.id, selectedUser.id)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 text-center text-sm text-slate-400">
                        Select a user to award badges
                    </div>
                )}
            </div>
        </div>
    )
}