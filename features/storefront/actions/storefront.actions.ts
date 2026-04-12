import api from "@/lib/api"

export interface ProductFilters {
    search?: string
    categoryId?: string
    page?: number
    limit?: number
}

export async function fetchProducts(filters: ProductFilters = {}) {
    const { data } = await api.get("/products", { params: filters })
    return data
}

export async function fetchProduct(id: string) {
    const { data } = await api.get(`/products/${id}`)
    return data
}

export async function fetchCategories() {
    const { data } = await api.get("/categories")
    return data
}

export async function fetchBestSellers(limit = 10) {
    const { data } = await api.get(`/products/best-sellers?limit=${limit}`)
    return data
}
export async function fetchShopSettings() {
    const { data } = await api.get("/shop-settings")
    return data
}