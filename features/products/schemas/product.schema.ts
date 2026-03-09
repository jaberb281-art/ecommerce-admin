import { z } from "zod"

// ------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------

export const productStatusEnum = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"])
export type ProductStatus = z.infer<typeof productStatusEnum>

// ------------------------------------------------------------------
// Allowed sort fields — whitelist prevents arbitrary field injection
// ------------------------------------------------------------------

export const PRODUCT_SORT_FIELDS = ["name", "price", "stock", "createdAt"] as const
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number]

// ------------------------------------------------------------------
// Base schema
// ------------------------------------------------------------------

const productBaseSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(255, "Name must be under 255 characters")
        .trim(),
    slug: z
        .string()
        .min(3)
        .max(255)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(), // optional because we'll auto-generate it if not provided

    description: z
        .string()
        .max(5000, "Description must be under 5000 characters")
        .trim()
        .optional()
        .or(z.literal("")),

    price: z.coerce
        .number()
        .positive("Price must be greater than 0")
        .multipleOf(0.01, "Price can have at most 2 decimal places"),

    stock: z.coerce
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),

    categoryId: z
        .string()
        .uuid("Invalid category"),

    status: productStatusEnum.default("DRAFT"),

    images: z
        .array(z.string().url("Each image must be a valid URL"))
        .min(1, "At least one image is required")
        .max(8, "Maximum 8 images allowed"),
})

// ------------------------------------------------------------------
// Create
// ------------------------------------------------------------------

export const createProductSchema = productBaseSchema

export type ProductInput = z.infer<typeof createProductSchema>

// ------------------------------------------------------------------
// Update — all fields optional except id
// ------------------------------------------------------------------

export const updateProductSchema = productBaseSchema
    .partial()
    .extend({
        id: z.string().uuid("Invalid product ID"),
    })

export type ProductUpdateInput = z.infer<typeof updateProductSchema>

// ------------------------------------------------------------------
// Filters
// ------------------------------------------------------------------

export const productFilterSchema = z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    status: productStatusEnum.optional(),
    page: z.coerce.number().int().positive().default(1),
    per_page: z.coerce.number().int().min(10).max(100).default(20),
    sort: z
        .string()
        .refine(
            (v) => {
                if (!v) return true
                const [field, dir] = v.split(".")
                return (
                    (PRODUCT_SORT_FIELDS as readonly string[]).includes(field) &&
                    ["asc", "desc"].includes(dir)
                )
            },
            { message: "Invalid sort. Use field.asc or field.desc" }
        )
        .optional(),
})

export type ProductFilters = z.infer<typeof productFilterSchema>
export type ProductEditDefaults = Required<Omit<ProductUpdateInput, "description">> & {
    description: string
}
// alias for any files importing productSchema directly
export const productSchema = createProductSchema