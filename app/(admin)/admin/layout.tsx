import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Tag,
    Ticket,
    Award,
    BarChart2,
    UserCheck,
} from "lucide-react"

const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/customers", label: "Customers", icon: UserCheck },
    { href: "/admin/categories", label: "Categories", icon: Tag },
    { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    { href: "/admin/badges", label: "Badges", icon: Award },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },

]

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value
    const userCookie = cookieStore.get("user")?.value

    if (!token) redirect("/login")

    const user = userCookie ? JSON.parse(userCookie) : null

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* Sidebar */}
            <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
                <div className="flex h-16 items-center border-b border-slate-100 px-5">
                    <span className="text-lg font-bold text-slate-900">⚡ Admin</span>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-slate-100 p-3">
                    <div className="mb-2 flex items-center gap-3 px-3 py-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                            {user?.name?.[0]?.toUpperCase() ?? "A"}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-900">
                                {user?.name ?? "Admin"}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/logout"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Sign out
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
                    <span className="text-sm text-slate-500">Admin</span>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {user?.role}
                        </span>
                        <span className="text-sm text-slate-600">{user?.name}</span>
                    </div>
                </header>

                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}