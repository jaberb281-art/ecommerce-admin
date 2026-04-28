"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X, ImagePlus, Loader2 } from "lucide-react"
import Image from "next/image"
import {
    createProductSchema,
    updateProductSchema,
    type ProductInput,
    type ProductUpdateInput,
} from "@/features/products/schemas/product.schema"
import { createProduct, updateProduct } from "@/features/products/actions/product.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Category {
    id: string
    name: string
}

interface ExistingProduct {
    id: string
    name: string
    description: string | null
    price: unknown
    stock: number
    status: "ACTIVE" | "DRAFT" | "ARCHIVED"
    images: string[]
    categoryId: string
}

interface ProductFormProps {
    categories: Category[]
    /** Pass an existing product to switch to edit mode. Omit for create mode. */
    product?: ExistingProduct
}

export function ProductForm({ categories, product }: ProductFormProps) {
    const isEditing = !!product
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<ProductUpdateInput>({
        resolver: zodResolver(isEditing ? updateProductSchema : createProductSchema) as any,
        defaultValues: isEditing
            ? {
                id: product.id,
                name: product.name,
                description: product.description ?? "",
                price: Number(product.price),
                stock: product.stock,
                categoryId: product.categoryId,
                status: product.status,
                images: product.images,
            }
            : {
                name: "",
                description: "",
                price: 0,
                stock: 0,
                categoryId: "",
                status: "DRAFT",
                images: [],
            },
    })

    const images = form.watch("images") ?? []

    function removeImage(url: string) {
        form.setValue(
            "images",
            images.filter((img) => img !== url),
            { shouldValidate: true }
        )
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)

        try {
            const uploadedUrls: string[] = []

            for (const file of Array.from(files)) {
                // Client-side guard: 5 MB matches backend (IMAGE_UPLOAD_OPTIONS).
                // Catching it here avoids a wasted round-trip + clearer error.
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (max 5 MB)`)
                    return
                }

                const formData = new FormData()
                formData.append("file", file)

                // Upload directly via the admin proxy. Going through a server
                // action would hit Next.js's 1 MB body size limit and silently
                // 413 on most photos.
                const res = await fetch("/api/proxy/products/upload-image", {
                    method: "POST",
                    body: formData,
                    // Do NOT set Content-Type — the browser must set the
                    // multipart/form-data boundary itself.
                })

                if (!res.ok) {
                    const body = await res.json().catch(() => ({})) as { message?: string }
                    toast.error(body.message ?? `Upload failed (${res.status})`)
                    return
                }

                const data = await res.json() as { url?: string }
                if (!data.url) {
                    toast.error("Upload succeeded but no URL returned")
                    return
                }
                uploadedUrls.push(data.url)
            }

            form.setValue("images", [...images, ...uploadedUrls], { shouldValidate: true })
            toast.success("Images uploaded successfully")
        } catch (err) {
            console.error("Image upload error:", err)
            toast.error("Failed to upload images")
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
    }

    function onSubmit(values: ProductUpdateInput) {
        startTransition(async () => {
            const result = isEditing
                ? await updateProduct(values)
                : await createProduct(values as ProductInput)

            if (!result.success) {
                if (typeof result.error === "object") {
                    Object.entries(result.error).forEach(([field, messages]) => {
                        form.setError(field as keyof ProductUpdateInput, {
                            message: Array.isArray(messages) ? messages[0] : String(messages),
                        })
                    })
                } else {
                    toast.error(result.error)
                }
                return
            }

            toast.success(isEditing ? "Product updated successfully" : "Product created successfully")
            router.refresh()
            router.push("/admin/products")
        })
    }

    const isDisabled = isPending || isUploading

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Basic Info */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Basic Info
                    </h2>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Wireless Headphones" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the product..."
                                        className="min-h-[120px] resize-y"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                {/* Pricing & Inventory */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Pricing & Inventory
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                {/* Organisation */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Organisation
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? "DRAFT"}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                {/* Images */}
                <section className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Images
                    </h2>
                    <FormField
                        control={form.control}
                        name="images"
                        render={() => (
                            <FormItem>
                                <FormLabel>Product Images</FormLabel>
                                <FormControl>
                                    <div className="space-y-4">
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                                {images.map((url) => (
                                                    <div
                                                        key={url}
                                                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                                    >
                                                        <Image src={url} alt="Product" fill className="object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(url)}
                                                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {images.length < 8 && (
                                            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                                                {isUploading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                                )}
                                                <span className="text-sm text-muted-foreground">
                                                    {isUploading ? "Uploading..." : "Click to upload images"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    disabled={isUploading}
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isDisabled}>
                        {isPending
                            ? (isEditing ? "Saving..." : "Creating...")
                            : (isEditing ? "Save Changes" : "Create Product")
                        }
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}