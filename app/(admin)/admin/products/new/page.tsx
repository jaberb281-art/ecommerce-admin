import { ProductForm } from "@/features/products/components/product-form"
import { backendJSON } from "@/lib/backend"

export default async function NewProductPage() {
    const categories = await backendJSON<{ id: string; name: string }[]>("/categories")

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
                <ProductForm categories={categories} />
            </div>
        </div>
    )
}