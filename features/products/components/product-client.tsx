"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import { columns, ProductColumn } from "./product-columns"
import { Separator } from "@/components/ui/separator"

interface ProductClientProps {
    data: ProductColumn[]
}

export const ProductClient = ({ data }: ProductClientProps) => {
    const router = useRouter()

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Products ({data.length})
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage products for your store
                    </p>
                </div>
                <Button onClick={() => router.push(`/admin/products/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable columns={columns} data={data} searchKey="name" />
        </>
    )
}