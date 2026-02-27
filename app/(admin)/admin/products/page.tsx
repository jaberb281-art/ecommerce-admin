// app/(admin)/admin/products/[id]/page.tsx
import { notFound } from "next/navigation"
import { getProduct } from "@/features/products/actions/products.actions"
import { db } from "@/lib/db"
import { ProductEditForm } from "@/features/products/components/product-edit-form"

interface Props {
    params: { id: string }
}

export default async function EditProductPage({ params }: Props) {
    const [product, categories] = await Promise.all([
        getProduct(params.id),
        db.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ])

    if (!product) notFound()

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