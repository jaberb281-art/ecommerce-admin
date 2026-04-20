import { getAccessToken } from "@/lib/auth"
// Server Component — fetches data server-side like all other admin pages
import { cookies } from "next/headers"
import axios from "axios"
import { PointsClient } from "./PointsClient"

const API_BASE = `${(process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")}/api`

export const dynamic = "force-dynamic"

async function getToken() {
    const cookieStore = await cookies()
    return await getAccessToken()
}

async function getUsers() {
    try {
        const token = await getToken()
        const { data } = await axios.get(`${API_BASE}/users?limit=200`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return { data: data.data ?? [], error: null }
    } catch (err: any) {
        return { data: [], error: err.response?.data?.message ?? err.message }
    }
}

export default async function PointsPage() {
    const { data: users, error } = await getUsers()
    return <PointsClient initialUsers={users} initialError={error} />
}