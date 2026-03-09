import { cookies } from "next/headers"
import axios from "axios"

const API_URL = process.env.API_URL || "http://localhost:3000"

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
}

export async function getDashboardStats() {
    try {
        const token = await getToken()
        console.log("Dashboard token:", token?.slice(0, 20))
        const { data } = await axios.get(`${API_URL}/orders/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data
    } catch (err: any) {
        console.log("Dashboard stats error:", err?.response?.status, err?.response?.data)
        return null
    }
}

export async function getLowStockProducts() {
    try {
        const token = await getToken()
        const { data } = await axios.get(`${API_URL}/products?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data.data ?? []
    } catch {
        return []
    }
}

export async function getRecentProducts() {
    try {
        const token = await getToken()
        const { data } = await axios.get(`${API_URL}/products?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data.data ?? []
    } catch {
        return []
    }
}