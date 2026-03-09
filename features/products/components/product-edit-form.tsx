"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X, ImagePlus, Loader2 } from "lucide-react"
import Image from "next/image"
// import axios from "axios"
import { uploadImage } from "@/features/products/actions/upload.actions"

import {
    updateProductSchema,
    type ProductUpdateInput,
    type ProductEditDefaults,
} from "@/features/products/schemas/product.schema"
import { updateProduct } from "@/features/products/actions/product.actions"

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

interface Product {
    id: string
    name: string
    description: string | null
    price: unknown
    stock: number
    status: "ACTIVE" | "DRAFT" | "ARCHIVED"
    images: string[]
    categoryId: string
}

interface ProductEditFormProps {
    product: Product
    categories: Category[]
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<ProductUpdateInput, unknown, ProductEditDefaults>({
        resolver: zodResolver(updateProductSchema) as any,
        defaultValues: {
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            price: Number(product.price),
            stock: product.stock,
            categoryId: product.categoryId,
            status: product.status,
            images: product.images,
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
                const formData = new FormData()
                formData.append("file", file)

                const result = await uploadImage(formData)

                if ("error" in result) {
                    toast.error(result.error)
                    return
                }

                uploadedUrls.push(result.url)
            }

            form.setValue("images", [...images, ...uploadedUrls], { shouldValidate: true })
            toast.success("Images uploaded successfully")
        } catch {
            toast.error("Failed to upload images")
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
    }

    function onSubmit(values: ProductUpdateInput) {
        startTransition(async () => {
            const result = await updateProduct(values)

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

            toast.success("Product updated successfully")
            router.refresh()
            router.push("/admin/products")
        })
    }

    const isDisabled = isPending || isUploading

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

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
                                    <Input {...field} />
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
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}