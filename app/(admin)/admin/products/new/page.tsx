import { getAccessToken } from "@/lib/auth"
import { ProductForm } from "@/features/products/components/product-form"
import { cookies } from "next/headers"
import axios from "axios"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export default async function NewProductPage() {
    const cookieStore = await cookies()
    const token = await getAccessToken()

    const { data } = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const categories = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
    }))

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
                <ProductForm categories={categories} />
            </div>
        </div>
    )
}