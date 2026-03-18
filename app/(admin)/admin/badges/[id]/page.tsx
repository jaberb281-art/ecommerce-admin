import { cookies } from "next/headers"
import axios from "axios"

async function getBadge(id: string) {
    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8080").replace(/\/$/, "")
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    try {
        const { data } = await axios.get(`${API_BASE}/api/badges/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data
    } catch (error) {
        return null
    }
}

export default async function EditBadgePage({ params }: { params: { id: string } }) {
    const { id } = await params
    const badge = await getBadge(id)

    if (!badge) return <div className="p-6">Badge not found</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Edit Badge: {badge.name}</h1>
            {/* Your form goes here */}
        </div>
    )
}