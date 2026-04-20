import { getAccessToken } from "@/lib/auth"
import { cookies } from "next/headers"
import axios from "axios"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export async function getEvents() {
    try {
        const cookieStore = await cookies()
        const token = await getAccessToken()
        const { data } = await axios.get(`${API_URL}/events/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data
    } catch {
        return []
    }
}