"use server"

import { backendJSON } from "@/lib/backend"
import { ProductColumn } from "../components/product-columns"
import { format } from "date-fns"

export const getProducts = async (): Promise<ProductColumn[]> => {
    const data = await backendJSON<{ data: any[] }>("/products?limit=50&adminMode=true")
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