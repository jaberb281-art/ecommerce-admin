import { cookies } from "next/headers"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DeleteCategoryButton } from "@/features/categories/components/delete-category-button"
import { backendJSON } from "@/lib/backend"

export const dynamic = "force-dynamic"

async function getCategories() {
    try {
        return await backendJSON<any[]>("/categories")
    } catch {
        return []
    }
}

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage product categories</p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Slug</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Products</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                    No categories yet
                                </td>
                            </tr>
                        ) : (
                            categories.map((category: any) => (
                                <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                                    <td className="px-4 py-3 text-slate-500">{category.productCount ?? 0}</td>                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/categories/${category.id}`}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <DeleteCategoryButton id={category.id} name={category.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}