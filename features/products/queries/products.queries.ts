import { cookies } from "next/headers"
import axios from "axios"
import { ProductColumn } from "../components/product-columns"
import { format } from "date-fns"

// Normalize backend base URL and ensure /api prefix
const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export const getProducts = async (): Promise<ProductColumn[]> => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || cookieStore.get("access_token")?.value

    const { data } = await axios.get(`${API_URL}/products?limit=50&adminMode=true`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const products = data.data ?? []

    return products.map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status as "active" | "draft" | "archived",
        price: item.price.toString(),
        stock: item.stock,
        category: item.category?.name ?? "Uncategorized",
        createdAt: format(new Date(item.createdAt), "MMM do, yyyy"),
    }))
}