"use server"

import { revalidatePath } from "next/cache"
import { backendFetch } from "@/lib/backend"
import {
    createProductSchema,
    updateProductSchema,
} from "@/features/products/schemas/product.schema"

export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string | Record<string, string[]> }

export async function createProduct(data: unknown): Promise<ActionResult<{ id: string }>> {
    try {
        const parsed = createProductSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.flatten().fieldErrors as Record<string, string[]> }
        }
        const res = await backendFetch("/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        const product = await res.json()
        revalidatePath("/admin/products")
        return { success: true, data: { id: product.id } }
    } catch (error) {
        console.error("[createProduct]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function updateProduct(data: unknown): Promise<ActionResult<{ id: string }>> {
    try {
        const parsed = updateProductSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.flatten().fieldErrors as Record<string, string[]> }
        }
        const { id, ...rest } = parsed.data
        const res = await backendFetch(`/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rest),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        revalidatePath("/admin/products")
        revalidatePath(`/admin/products/${id}`)
        return { success: true, data: { id: id! } }
    } catch (error) {
        console.error("[updateProduct]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
    try {
        const res = await backendFetch(`/products/${id}`, { method: "DELETE" })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as any
            return { success: false, error: body?.message ?? `Error ${res.status}` }
        }
        revalidatePath("/admin/products")
        return { success: true, data: undefined }
    } catch (error) {
        console.error("[deleteProduct]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function deleteProducts(ids: string[]): Promise<ActionResult<{ count: number }>> {
    try {
        if (!ids.length) return { success: false, error: "No products selected." }
        await Promise.all(ids.map((id) => backendFetch(`/products/${id}`, { method: "DELETE" })))
        revalidatePath("/admin/products")
        return { success: true, data: { count: ids.length } }
    } catch (error) {
        console.error("[deleteProducts]", error)
        return { success: false, error: "Something went wrong. Please try again." }
    }
}

export async function getProduct(id: string) {
    try {
        const res = await backendFetch(`/products/${id}`)
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}