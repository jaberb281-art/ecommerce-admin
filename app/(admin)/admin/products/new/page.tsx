import { ProductForm } from "@/features/products/components/product-form"
import { db } from "@/lib/db/db"

export default async function NewProductPage() {
    // Fetch real categories from your DB to fill the dropdown
    const categories = await db.category.findMany({
        orderBy: { name: "asc" }
    })

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
                <ProductForm categories={categories} />
            </div>
        </div>
    )
}