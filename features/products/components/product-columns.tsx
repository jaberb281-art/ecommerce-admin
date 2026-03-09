"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteProduct } from "@/features/products/actions/product.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export type ProductColumn = {
    id: string
    name: string
    price: string
    stock: number
    category: string
    status: "active" | "draft" | "archived" | "ACTIVE" | "DRAFT" | "ARCHIVED"
    createdAt: string
}

function ActionsCell({ id }: { id: string }) {
    const router = useRouter()

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this product?")) return
        const result = await deleteProduct(id)
        if (result.success) {
            toast.success("Product deleted")
            router.refresh()
        } else {
            toast.error("Failed to delete product")
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Link href={`/admin/products/${id}`}>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </Link>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export const columns: ColumnDef<ProductColumn>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = (row.getValue("status") as string).toUpperCase()
            return (
                <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "stock",
        header: "Stock",
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionsCell id={row.original.id} />,
    },
]