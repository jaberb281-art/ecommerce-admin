// Server Component — fetches data server-side like all other admin pages
import { PointsClient } from "./PointsClient"
import { backendJSON } from "@/lib/backend"

export const dynamic = "force-dynamic"

async function getUsers() {
    try {
        const data = await backendJSON<{ data: any[] }>("/users?limit=200")
        return { data: data.data ?? [], error: null }
    } catch (err: any) {
        return { data: [], error: err.message }
    }
}

export default async function PointsPage() {
    const { data: users, error } = await getUsers()
    return <PointsClient initialUsers={users} initialError={error} />
}