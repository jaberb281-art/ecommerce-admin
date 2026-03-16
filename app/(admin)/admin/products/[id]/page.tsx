// app/(admin)/admin/products/[id]/page.tsx
import { notFound } from "next/navigation"
import { getProduct } from "@/features/products/actions/product.actions"
import { cookies } from "next/headers"
import axios from "axios"
import { ProductEditForm } from "@/features/products/components/product-edit-form"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    const [product, categoriesRes] = await Promise.all([
        getProduct(id),
        axios.get(`${API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
    ])

    if (!product) notFound()

    const categories = categoriesRes.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
    }))

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Updating <span className="font-medium text-slate-700">{product.name}</span>
                </p>
            </div>
            <ProductEditForm product={product} categories={categories} />
        </div>
    )
}