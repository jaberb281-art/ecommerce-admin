import { format } from "date-fns"
import Link from "next/link"
import { ChevronRight, Star } from "lucide-react"
import { backendJSON } from "@/lib/backend"

const PROFILE_BG_PRESETS: Record<string, { background: string }> = {
    "warm-sand": { background: "linear-gradient(135deg, #f5e6c8 0%, #e8d5a3 50%, #d4b896 100%)" },
    "sky-mist": { background: "linear-gradient(135deg, #dce8f5 0%, #b8d4ed 50%, #9ec4e8 100%)" },
    "sage-bloom": { background: "linear-gradient(135deg, #d4e8d0 0%, #b8d9b2 50%, #9ec99a 100%)" },
    "rose-dust": { background: "linear-gradient(135deg, #f5dde0 0%, #edc4c8 50%, #e0acb0 100%)" },
    "midnight": { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
    "teal-depth": { background: "linear-gradient(135deg, #1a3a3a 0%, #2d6e5e 50%, #3d8a72 100%)" },
    "lavender-haze": { background: "linear-gradient(135deg, #e8e0f5 0%, #d4c4ed 50%, #c0a8e6 100%)" },
    "golden-hour": { background: "linear-gradient(135deg, #2d1b00 0%, #8b4513 30%, #d2691e 60%, #f4a460 100%)" },
    "arctic": { background: "linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 50%, #cce4ff 100%)" },
}

async function getUsers() {
    try {
        const data = await backendJSON<{ data: any[] }>("/users?page=1&limit=50")
        return data.data ?? []
    } catch (error: any) {
        console.error("[getUsers] Error:", error.message)
        return []
    }
}

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                <p className="text-sm text-slate-500 mt-1">Manage customer accounts and profile appearances</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">User</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Banner</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Points</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Orders</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Joined</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => {
                                const bgStyle = PROFILE_BG_PRESETS[user.profileBg ?? "warm-sand"] ?? PROFILE_BG_PRESETS["warm-sand"]
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-9 w-9 shrink-0">
                                                    <div className="absolute inset-0 rounded-full" style={bgStyle} />
                                                    <div className="absolute inset-0.5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold text-white">
                                                        {(user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{user.name ?? "—"}</p>
                                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-7 w-16 rounded-lg overflow-hidden border border-slate-200" style={bgStyle} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "ADMIN" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-sm text-slate-700">
                                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                {(user.pointsBalance ?? 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 font-medium">
                                            {user.orderCount ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/users/${user.id}`}
                                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                                                Edit <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}