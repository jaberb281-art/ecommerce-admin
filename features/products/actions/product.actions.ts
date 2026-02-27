"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import {
    createProductSchema,
    updateProductSchema,
    productFilterSchema,
    PRODUCT_SORT_FIELDS,
    type ProductInput,
    type ProductUpdateInput,
    type ProductFilters,
} from "@/features/products/schemas/product.schema"  // ← correct path

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string | Record<string, string[]> }

// ------------------------------------------------------------------
// Auth guard
// ------------------------------------------------------------------

async function requireAdmin() {
    const session = await auth()
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized")
    }
    return session
}

// ------------------------------------------------------------------
// Prisma error handler — maps known DB errors to readable messages
// ------------------------------------------------------------------

function handlePrismaError(error: unknown): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return "A product with this name already exists."
            case "P2025":
                return "Product not found."
            case "P2003":
                return "Invalid category selected."
            default:
                return `Database error: ${error.code}`
        }
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
        await requireAdmin()

        const parsed = createProductSchema.safeParse(data)
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
            }
        }

        const { description, ...rest } = parsed.data

        const product = await db.product.create({
            data: {
                ...rest,
                description: description || null,  // "" → null
            },
            select: { id: true },
        })

        revalidatePath("/admin/products")
        return { success: true, data: { id: product.id } }

    } catch (error) {
        console.error("[createProduct]", error)
        return { success: false, error: handlePrismaError(error) }
    }
}

// ------------------------------------------------------------------
// UPDATE
// ------------------------------------------------------------------

export async function updateProduct(
    data: unknown
): Promise<ActionResult<{ id: string }>> {
    try {
        await requireAdmin()

        const parsed = updateProductSchema.safeParse(data)
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
            }
        }

        const { id, description, ...rest } = parsed.data

        await db.product.update({
            where: { id },       // Prisma throws P2025 if not found — caught below
            data: {
                ...rest,
                // Only update description if it was explicitly included in the payload
                ...(description !== undefined && { description: description || null }),
                // No updatedAt needed — Prisma @updatedAt handles this automatically
            },
        })

        revalidatePath("/admin/products")
        revalidatePath(`/admin/products/${id}`)
        return { success: true, data: { id } }

    } catch (error) {
        console.error("[updateProduct]", error)
        return { success: false, error: handlePrismaError(error) }
    }
}

// ------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------

export async function deleteProduct(
    id: string
): Promise<ActionResult> {
    try {
        await requireAdmin()

        const idParsed = updateProductSchema.shape.id.safeParse(id)
        if (!idParsed.success) {
            return { success: false, error: "Invalid product ID." }
        }

        await db.product.delete({ where: { id } })  // P2025 if not found

        revalidatePath("/admin/products")
        return { success: true, data: undefined }

    } catch (error) {
        console.error("[deleteProduct]", error)
        return { success: false, error: handlePrismaError(error) }
    }
}

// ------------------------------------------------------------------
// DELETE MANY
// ------------------------------------------------------------------

export async function deleteProducts(
    ids: string[]
): Promise<ActionResult<{ count: number }>> {
    try {
        await requireAdmin()

        if (!ids.length) {
            return { success: false, error: "No products selected." }
        }

        // Validate every id is a valid UUID before hitting the DB
        const validIds = ids.filter((id) =>
            updateProductSchema.shape.id.safeParse(id).success
        )

        if (validIds.length === 0) {
            return { success: false, error: "No valid product IDs provided." }
        }

        const { count } = await db.product.deleteMany({
            where: { id: { in: validIds } },
        })

        revalidatePath("/admin/products")
        return { success: true, data: { count } }

    } catch (error) {
        console.error("[deleteProducts]", error)
        return { success: false, error: handlePrismaError(error) }
    }
}

// ------------------------------------------------------------------
// GET LIST — plain async function, not a mutation
// Call from RSC pages directly, not from client components
// ------------------------------------------------------------------

export async function getProducts(rawFilters: unknown) {
    await requireAdmin()

    // safeParse so malformed URL params don't throw — fall back to defaults
    const result = productFilterSchema.safeParse(rawFilters)
    const filters = result.success ? result.data : productFilterSchema.parse({})

    const { search, categoryId, status, page, per_page, sort } = filters
    const offset = (page - 1) * per_page

    // Whitelist sort field to prevent arbitrary Prisma field injection
    const [rawField = "createdAt", sortDir = "desc"] = sort?.split(".") ?? []
    const sortField = (PRODUCT_SORT_FIELDS as readonly string[]).includes(rawField)
        ? rawField
        : "createdAt"
    const orderBy = { [sortField]: sortDir as "asc" | "desc" }

    const where: Prisma.ProductWhereInput = {
        ...(search && {
            name: { contains: search, mode: "insensitive" },
        }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
    }

    const [data, total] = await Promise.all([
        db.product.findMany({
            where,
            orderBy,
            take: per_page,
            skip: offset,
            select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                status: true,
                images: true,
                createdAt: true,
                category: { select: { id: true, name: true } },
            },
        }),
        db.product.count({ where }),
    ])

    return {
        data,
        pageCount: Math.ceil(total / per_page),
        total,
    }
}

// ------------------------------------------------------------------
// GET SINGLE — for the edit form
// ------------------------------------------------------------------

export async function getProduct(id: string) {
    await requireAdmin()

    const idParsed = updateProductSchema.shape.id.safeParse(id)
    if (!idParsed.success) return null

    return db.product.findUnique({
        where: { id },
        include: { category: { select: { id: true, name: true } } },
    })
}