"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, X, ImagePlus } from "lucide-react"
import Image from "next/image"

// ✅ Fixed import paths
import { createProductSchema, type ProductInput } from "@/features/products/schemas/product.schema"
import { createProduct } from "@/features/products/actions/products.actions"

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
import { UploadButton } from "@/lib/uploadthing"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface Category {
    id: string
    name: string
}

interface ProductFormProps {
    categories: Category[]
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function ProductForm({ categories }: ProductFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<ProductInput>({
        // ✅ createProductSchema instead of productSchema
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            categoryId: "",
            status: "draft",
            images: [],
        },
    })

    const images = form.watch("images")

    function removeImage(url: string) {
        form.setValue(
            "images",
            images.filter((img) => img !== url),
            { shouldValidate: true }
        )
    }

    function onSubmit(values: ProductInput) {
        startTransition(async () => {
            const result = await createProduct(values)

            // ✅ ActionResult discriminated union — check success flag
            if (!result.success) {
                if (typeof result.error === "object") {
                    Object.entries(result.error).forEach(([field, messages]) => {
                        form.setError(field as keyof ProductInput, {
                            message: Array.isArray(messages) ? messages[0] : String(messages),
                        })
                    })
                } else {
                    toast.error(result.error)
                }
                return
            }

            toast.success("Product created successfully")
            // ✅ Correct admin route
            router.push("/admin/products")
            router.refresh()
        })
    }

    const isDisabled = isPending || isUploading

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* ── Basic Info ─────────────────────────────────────────── */}
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                {/* ── Pricing & Inventory ────────────────────────────────── */}
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
                                    <FormLabel>Price ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                                            min="0"
                                            placeholder="0"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                {/* ── Organisation ───────────────────────────────────────── */}
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                {/* ── Images ─────────────────────────────────────────────── */}
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
                                                        <Image
                                                            src={url}
                                                            alt="Product image"
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(url)}
                                                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                            aria-label="Remove image"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {images.length < 8 && (
                                            <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                                                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                                <UploadButton
                                                    endpoint="productImage"
                                                    onUploadBegin={() => setIsUploading(true)}
                                                    onClientUploadComplete={(res) => {
                                                        setIsUploading(false)
                                                        const urls = res.map((f) => f.url)
                                                        form.setValue("images", [...images, ...urls], {
                                                            shouldValidate: true,
                                                        })
                                                    }}
                                                    onUploadError={(err) => {
                                                        setIsUploading(false)
                                                        toast.error(`Upload failed: ${err.message}`)
                                                    }}
                                                    appearance={{
                                                        button: "bg-transparent text-sm text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
                                                        allowedContent: "text-xs text-muted-foreground",
                                                    }}
                                                />
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    {images.length}/8
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                {/* ── Actions ────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isDisabled} className="min-w-[120px]">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Create Product"
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={isDisabled}
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}