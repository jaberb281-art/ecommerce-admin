import { db } from "@/lib/db"

// ------------------------------------------------------------------
// Stats cards — total revenue, orders, products, customers
// ------------------------------------------------------------------

export async function getDashboardStats() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
        revenueResult,
        previousRevenueResult,
        activeOrders,
        previousOrders,
        totalProducts,
        totalCustomers,
        previousCustomers,
    ] = await Promise.all([
        // Revenue this period
        db.order.aggregate({
            _sum: { total: true },
            where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "cancelled" } },
        }),
        // Revenue previous period (for % change)
        db.order.aggregate({
            _sum: { total: true },
            where: {
                createdAt: {
                    gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
                    lt: thirtyDaysAgo,
                },
                status: { not: "cancelled" },
            },
        }),
        // Active orders this period
        db.order.count({
            where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "cancelled" } },
        }),
        // Active orders previous period
        db.order.count({
            where: {
                createdAt: {
                    gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
                    lt: thirtyDaysAgo,
                },
                status: { not: "cancelled" },
            },
        }),
        db.product.count({ where: { status: "active" } }),
        db.user.count({ where: { role: "customer" } }),
        db.user.count({
            where: {
                role: "customer",
                createdAt: { lt: thirtyDaysAgo },
            },
        }),
    ])

    const currentRevenue = Number(revenueResult._sum.total ?? 0)
    const prevRevenue = Number(previousRevenueResult._sum.total ?? 0)
    const revenueChange = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100

    const ordersChange = previousOrders === 0 ? 100 : ((activeOrders - previousOrders) / previousOrders) * 100

    const customersChange =
        previousCustomers === 0 ? 100 : ((totalCustomers - previousCustomers) / previousCustomers) * 100

    return {
        revenue: { value: currentRevenue, change: revenueChange },
        orders: { value: activeOrders, change: ordersChange },
        products: { value: totalProducts, change: null },
        customers: { value: totalCustomers, change: customersChange },
    }
}

// ------------------------------------------------------------------
// Revenue chart — daily totals for last 30 days
// ------------------------------------------------------------------

export async function getRevenueChart() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const orders = await db.order.findMany({
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: { not: "cancelled" },
        },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: "asc" },
    })

    // Build a map of date → { revenue, orders }
    const map = new Map<string, { revenue: number; orders: number }>()

    // Pre-fill all 30 days so gaps show as 0
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10) // "YYYY-MM-DD"
        map.set(key, { revenue: 0, orders: 0 })
    }

    for (const order of orders) {
        const key = order.createdAt.toISOString().slice(0, 10)
        const entry = map.get(key)
        if (entry) {
            entry.revenue += Number(order.total)
            entry.orders += 1
        }
    }

    return Array.from(map.entries()).map(([date, values]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Math.round(values.revenue * 100) / 100,
        orders: values.orders,
    }))
}

// ------------------------------------------------------------------
// Recent orders — last 5
// ------------------------------------------------------------------

export async function getRecentOrders() {
    return db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            user: { select: { name: true, email: true, image: true } },
        },
    })
}

// ------------------------------------------------------------------
// Recent customers — last 5 signups
// ------------------------------------------------------------------

export async function getRecentCustomers() {
    return db.user.findMany({
        where: { role: "customer" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            _count: { select: { orders: true } },
        },
    })
}

// ------------------------------------------------------------------
// Low stock — products with stock <= 10
// ------------------------------------------------------------------

export async function getLowStockProducts() {
    return db.product.findMany({
        where: { stock: { lte: 10 }, status: "active" },
        take: 5,
        orderBy: { stock: "asc" },
        select: {
            id: true,
            name: true,
            stock: true,
            images: true,
            category: { select: { name: true } },
        },
    })
}

// ------------------------------------------------------------------
// Latest reviews
// ------------------------------------------------------------------

export async function getLatestReviews() {
    return db.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true, image: true } },
            product: { select: { id: true, name: true } },
        },
    })
}