"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import axios from "axios"
import {
    createProductSchema,
    updateProductSchema,
    type ProductInput,
    type ProductUpdateInput,
} from "@/features/products/schemas/product.schema"

// Normalize backend base URL and ensure /api prefix
const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string | Record<string, string[]> }

async function getToken() {
    const cookieStore = await cookies()
    return cookieStore.get("token")?.value || cookieStore.get("access_token")?.value
}

function handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || "Something went wrong."
    }
    return "Something went wrong. Please try again."
}

// ------------------------------------------------------------------
// CREATE
// ------------------------------------------------------------------

export async function createProduct(
    data: unknown
): Promise<ActionResult<{ id: string }>> {
    try {
        const parsed = createProductSchema.safeParse(data)
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
            }
        }

        const token = await getToken()
        const { data: product } = await axios.post(
            `${API_URL}/products`,
            parsed.data,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        revalidatePath("/admin/products")
        return { success: true, data: { id: product.id } }

    } catch (error) {
        console.error("[createProduct]", error)
        return { success: false, error: handleError(error) }
    }
}

// ------------------------------------------------------------------
// UPDATE
// ------------------------------------------------------------------

export async function updateProduct(
    data: unknown
): Promise<ActionResult<{ id: string }>> {
    try {
        const parsed = updateProductSchema.safeParse(data)
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
            }
        }

        const { id, ...rest } = parsed.data
        const token = await getToken()

        await axios.patch(
            `${API_URL}/products/${id}`,
            rest,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        revalidatePath("/admin/products")
        revalidatePath(`/admin/products/${id}`)
        return { success: true, data: { id: id! } }

    } catch (error) {
        console.error("[updateProduct]", error)
        return { success: false, error: handleError(error) }
    }
}

// ------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------

export async function deleteProduct(
    id: string
): Promise<ActionResult> {
    try {
        const token = await getToken()

        await axios.delete(`${API_URL}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        revalidatePath("/admin/products")
        return { success: true, data: undefined }

    } catch (error) {
        console.error("[deleteProduct]", error)
        return { success: false, error: handleError(error) }
    }
}

// ------------------------------------------------------------------
// DELETE MANY
// ------------------------------------------------------------------

export async function deleteProducts(
    ids: string[]
): Promise<ActionResult<{ count: number }>> {
    try {
        if (!ids.length) {
            return { success: false, error: "No products selected." }
        }

        const token = await getToken()

        await Promise.all(
            ids.map((id) =>
                axios.delete(`${API_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
        )

        revalidatePath("/admin/products")
        return { success: true, data: { count: ids.length } }

    } catch (error) {
        console.error("[deleteProducts]", error)
        return { success: false, error: handleError(error) }
    }
}

// ------------------------------------------------------------------
// GET SINGLE — for the edit form
// ------------------------------------------------------------------

export async function getProduct(id: string) {
    try {
        const token = await getToken()
        const { data } = await axios.get(`${API_URL}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return data
    } catch {
        return null
    }
}