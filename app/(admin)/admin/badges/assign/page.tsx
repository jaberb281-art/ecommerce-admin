import { cookies } from "next/headers"
import axios from "axios"
import { AssignBadgePanel } from "@/features/badges/components/assign-badge-panel"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export const dynamic = "force-dynamic"

async function getData() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
    const headers = { Authorization: `Bearer ${token}` }

    const [badgesRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/badges`, { headers }),
        axios.get(`${API_URL}/badges/users`, { headers }),
    ])

    return {
        badges: badgesRes.data ?? [],
        users: usersRes.data ?? [],
    }
}

export default async function AssignBadgePage() {
    const { badges, users } = await getData()

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Assign Badges</h1>
                <p className="text-sm text-slate-500 mt-1">Award badges to users manually</p>
            </div>
            <AssignBadgePanel badges={badges} users={users} />
        </div>
    )
}