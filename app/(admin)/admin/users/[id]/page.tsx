import { cookies } from "next/headers"
import axios from "axios"

async function getUser(id: string) {
    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8080").replace(/\/$/, "")
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    try {
        const { data } = await axios.get(`${API_BASE}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data
    } catch (error) {
        return null
    }
}

export default async function UserEditPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const user = await getUser(id)

    if (!user) return <div className="p-6">User not found</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900">Edit User: {user.name}</h1>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Email: {user.email}</p>
                <p className="text-sm text-slate-500">Current Role: {user.role}</p>
                {/* Form to change role or name goes here */}
            </div>
        </div>
    )
}