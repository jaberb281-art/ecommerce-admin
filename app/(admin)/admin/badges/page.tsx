import { getAccessToken } from "@/lib/auth"
import { cookies } from "next/headers"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DeleteBadgeButton } from "@/features/badges/components/delete-badge-button"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export const dynamic = "force-dynamic"

async function getBadges() {
    try {
        const cookieStore = await cookies()
        const token = await getAccessToken()
        const { data } = await axios.get(`${API_URL}/badges`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data ?? []
    } catch {
        return []
    }
}

export default async function BadgesPage() {
    const badges = await getBadges()

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Badges</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage badges to award to users</p>
                </div>
                <Link
                    href="/admin/badges/new"
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Badge
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {badges.length === 0 ? (
                    <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                        No badges yet. Create your first badge.
                    </div>
                ) : (
                    badges.map((badge: any) => (
                        <div key={badge.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                            {badge.imageUrl ? (
                                <Image
                                    src={badge.imageUrl}
                                    alt={badge.name}
                                    width={56}
                                    height={56}
                                    className="h-14 w-14 rounded-full object-cover border-2 border-slate-100"
                                />
                            ) : (
                                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                                    🏅
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{badge.name}</p>
                                <p className="text-xs text-slate-400 truncate">{badge.description ?? "No description"}</p>
                                <p className="text-xs text-slate-400 mt-1">{badge._count?.userBadges ?? 0} users awarded</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Link
                                    href={`/admin/badges/${badge.id}`}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                                <DeleteBadgeButton id={badge.id} name={badge.name} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4">
                <Link
                    href="/admin/badges/assign"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    🎖️ Assign Badges to Users
                </Link>
            </div>
        </div>
    )
}