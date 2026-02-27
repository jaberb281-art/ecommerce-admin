"use server"

import { db } from "@/lib/db/db"
import { productSchema, ProductInput } from "@/schemas/product.schema"
import { revalidatePath } from "next/cache"

export async function createProduct(values: ProductInput) {
    const validatedFields = productSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    try {
        await db.product.create({
            data: {
                name: values.name,
                // Ensure your schema matches these fields!
                // description: values.description, 
                price: values.price,
                stock: values.stock,
                // categoryId: values.categoryId,
                // images: values.images,
            }
        })

        revalidatePath("/admin/products")
    } catch (error) {
        return { error: "Something went wrong. Please try again." }
    }
}