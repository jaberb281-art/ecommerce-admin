"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft, User, Mail, Phone, Star, ShoppingBag,
    Award, Check, Save, Palette, Shield, Calendar
} from "lucide-react"
import Link from "next/link"

// ── Shared BG Presets (mirrors storefront) ───────────────────────────────────
const PROFILE_BG_PRESETS = [
    { id: "warm-sand", label: "Warm Sand", style: { background: "linear-gradient(135deg, #f5e6c8 0%, #e8d5a3 50%, #d4b896 100%)" } },
    { id: "sky-mist", label: "Sky Mist", style: { background: "linear-gradient(135deg, #dce8f5 0%, #b8d4ed 50%, #9ec4e8 100%)" } },
    { id: "sage-bloom", label: "Sage Bloom", style: { background: "linear-gradient(135deg, #d4e8d0 0%, #b8d9b2 50%, #9ec99a 100%)" } },
    { id: "rose-dust", label: "Rose Dust", style: { background: "linear-gradient(135deg, #f5dde0 0%, #edc4c8 50%, #e0acb0 100%)" } },
    { id: "midnight", label: "Midnight", style: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" } },
    { id: "teal-depth", label: "Teal Depth", style: { background: "linear-gradient(135deg, #1a3a3a 0%, #2d6e5e 50%, #3d8a72 100%)" } },
    { id: "lavender-haze", label: "Lavender", style: { background: "linear-gradient(135deg, #e8e0f5 0%, #d4c4ed 50%, #c0a8e6 100%)" } },
    { id: "golden-hour", label: "Golden Hour", style: { background: "linear-gradient(135deg, #2d1b00 0%, #8b4513 30%, #d2691e 60%, #f4a460 100%)" } },
    { id: "arctic", label: "Arctic", style: { background: "linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 50%, #cce4ff 100%)" } },
]

function getProfileBgStyle(id: string | null | undefined) {
    if (!id) return PROFILE_BG_PRESETS[0].style
    return PROFILE_BG_PRESETS.find(p => p.id === id)?.style ?? PROFILE_BG_PRESETS[0].style
}

function getInitials(name?: string, email?: string) {
    const src = name || email || "U"
    return src.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatDate(d?: string) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

// ── Fetch helpers (client-side via /api/proxy) ───────────────────────────────
async function fetchUser(id: string) {
    const res = await fetch(`/api/proxy/users/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
}

async function patchUser(id: string, body: Record<string, any>) {
    const res = await fetch(`/api/proxy/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to update user")
    return res.json()
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [selectedBg, setSelectedBg] = useState<string>("warm-sand")
    const [error, setError] = useState("")

    useEffect(() => {
        fetchUser(id).then(data => {
            setUser(data)
            setSelectedBg(data?.profileBg ?? "warm-sand")
            setLoading(false)
        })
    }, [id])

    async function handleSaveBg(bgId: string) {
        setSaving(true)
        setError("")
        try {
            const updated = await patchUser(id, { profileBg: bgId })
            setUser((prev: any) => ({ ...prev, ...updated }))
            setSelectedBg(bgId)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch {
            setError("Failed to save. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 rounded-full border-2 border-slate-900 border-t-transparent" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-slate-500">User not found.</p>
                <Link href="/admin/users" className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="h-4 w-4" /> Back to Users
                </Link>
            </div>
        )
    }

    const bgStyle = getProfileBgStyle(selectedBg)

    return (
        <div className="p-6 max-w-4xl space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <Link href="/admin/users"
                    className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">User Profile</h1>
                    <p className="text-sm text-slate-500">Manage account settings and profile appearance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left col: Preview card + stats ── */}
                <div className="space-y-4">

                    {/* Profile preview */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="h-24 w-full transition-all duration-500" style={bgStyle} />
                        <div className="px-5 pb-5">
                            <div className="flex items-end -mt-7 mb-3">
                                <div className="h-14 w-14 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-md">
                                    {getInitials(user.name, user.email)}
                                </div>
                            </div>
                            <p className="text-base font-bold text-slate-900">{user.name || "—"}</p>
                            <p className="text-sm text-slate-500 mt-0.5 truncate">{user.email}</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                                    {user.role}
                                </span>
                                {user.phone && (
                                    <span className="text-xs text-slate-400">{user.phone}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Account Stats</p>
                        {[
                            { icon: ShoppingBag, label: "Total Orders", value: user.orderCount ?? 0 },
                            { icon: Star, label: "Points Balance", value: (user.pointsBalance ?? 0).toLocaleString() + " pts" },
                            { icon: Award, label: "Badges", value: user.userBadges?.length ?? 0 },
                            { icon: Calendar, label: "Member Since", value: formatDate(user.createdAt) },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                                    </div>
                                    <span className="text-sm text-slate-600">{label}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Badges */}
                    {user.userBadges?.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Badges</p>
                            <div className="flex flex-wrap gap-2">
                                {user.userBadges.map((ub: any) => (
                                    <span key={ub.id}
                                        className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <Award className="h-3 w-3" />
                                        {ub.badge?.name ?? "Badge"}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right col: BG Picker ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Banner picker */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Palette className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Profile Banner</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Choose the background shown on the user's profile</p>
                                </div>
                            </div>
                            {saved && (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                                    <Check className="h-3 w-3" /> Saved
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {PROFILE_BG_PRESETS.map((preset) => {
                                const isActive = selectedBg === preset.id
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => handleSaveBg(preset.id)}
                                        disabled={saving}
                                        className={`relative rounded-2xl overflow-hidden border-2 transition-all hover:scale-[0.97] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${isActive
                                                ? "border-slate-900 shadow-md"
                                                : "border-slate-200 hover:border-slate-400"
                                            }`}
                                    >
                                        <div className="h-20" style={preset.style} />
                                        <div className="py-2 px-3 bg-white border-t border-slate-100">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{preset.label}</p>
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center shadow-lg">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {error && (
                            <p className="mt-3 text-xs text-red-500 font-medium">{error}</p>
                        )}
                    </div>

                    {/* Account info (read-only for now) */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Account Info</p>
                                <p className="text-xs text-slate-400 mt-0.5">User account details</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: User, label: "Full Name", value: user.name || "—" },
                                { icon: Mail, label: "Email", value: user.email },
                                { icon: Phone, label: "Phone", value: user.phone || "—" },
                                { icon: Shield, label: "Role", value: user.role },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}