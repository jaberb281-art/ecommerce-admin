// app/(admin)/admin/products/page.tsx
import { getProducts } from "@/features/products/queries/products.queries"
import { ProductClient } from "@/features/products/components/product-client"

export default async function ProductsPage() {
    const products = await getProducts()

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductClient data={products} />
            </div>
        </div>
    )
}
