// app/(admin)/admin/users/page.tsx
import { cookies } from "next/headers"
import axios from "axios"
import { format } from "date-fns"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")

// FIX: Re-adding /api because your NestJS main.ts has app.setGlobalPrefix('api')
const API_URL = `${API_BASE}/api`

async function getUsers() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        // Now calling ${API_BASE}/api/users?...
        const { data } = await axios.get(`${API_URL}/users?page=1&limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        // This will log to your Railway/terminal console
        console.log("API Response Success:", data.data?.length, "users found");

        return data.data ?? []
    } catch (error: any) {
        // This log in image_7c45fe.png helped us find the 404!
        console.error("Fetch Error:", error.response?.data || error.message)
        return []
    }
}

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                <p className="text-sm text-slate-500 mt-1">Manage customer accounts</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                    No users found at {API_URL}/users
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                                                {user.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <span className="font-medium text-slate-900">{user.name ?? "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "ADMIN"
                                            ? "bg-purple-50 text-purple-700"
                                            : "bg-slate-100 text-slate-600"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}