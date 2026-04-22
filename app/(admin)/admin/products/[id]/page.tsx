import { notFound } from "next/navigation"
import { getProduct } from "@/features/products/actions/product.actions"
import { ProductForm } from "@/features/products/components/product-form"
import { backendJSON } from "@/lib/backend"

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
    const { id } = await params

    const [product, categories] = await Promise.all([
        getProduct(id),
        backendJSON<{ id: string; name: string }[]>("/categories"),
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
            <ProductForm product={product} categories={categories} />
        </div>
    )
}