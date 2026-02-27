import { db } from "@/lib/db/db"
import { ProductColumn } from "../components/product-columns"
import { format } from "date-fns"

export const getProducts = async (): Promise<ProductColumn[]> => {
    const products = await db.product.findMany({
        orderBy: {
            createdAt: "desc",
        },
    })

    return products.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status as "active" | "draft" | "archived",
        price: item.price.toString(),
        stock: item.stock,
        category: item.category || "Uncategorized",
        createdAt: format(item.createdAt, "MMM do, yyyy"),
    }))
}