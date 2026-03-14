import { cookies } from "next/headers"
import axios from "axios"

const API_URL = process.env.API_URL || "http://localhost:3000"

export async function getEvents() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
        const { data } = await axios.get(`${API_URL}/events/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data
    } catch {
        return []
    }
}