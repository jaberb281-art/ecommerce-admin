import { cookies } from "next/headers"
import axios from "axios"
import { format } from "date-fns"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
// FIX 1: Make sure this matches your actual backend route. 
// If your NestJS is at /users, removing /api might be necessary.
const API_URL = `${API_BASE}`

async function getUsers() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        // FIX 2: Add pagination parameters to the URL
        // Your backend service expects 'page' and 'limit'
        const { data } = await axios.get(`${API_URL}/users?page=1&limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        // FIX 3: Log this to your browser terminal (server-side) to see exactly what arrives
        console.log("API Response:", data);

        return data.data ?? []
    } catch (error: any) {
        console.error("Fetch Error:", error.response?.data || error.message)
        return []
    }
}

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6 p-6">
            {/* ... rest of your UI code remains the same ... */}
        </div>
    )
}