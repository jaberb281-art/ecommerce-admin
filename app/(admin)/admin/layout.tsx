// app/(admin)/admin/layout.tsx
import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
} from "lucide-react"

// ------------------------------------------------------------------
// Logout action
// ------------------------------------------------------------------

async function logoutAction() {
    "use server"
    await signOut({ redirectTo: "/login" })
}

// ------------------------------------------------------------------
// Nav items
// ------------------------------------------------------------------

const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Users", icon: Users },
]

// ------------------------------------------------------------------
// Layout — RSC, session-aware
// ------------------------------------------------------------------

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Secondary auth check — middleware is the first layer,
    // this is a safety net for direct RSC access
    const session = await auth()
    if (!session || session.user.role !== "admin") {
        redirect("/login")
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-slate-100 px-5">
                    <span className="text-lg font-bold text-slate-900">⚡ Admin</span>
                </div>

                {/* Nav */}
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

                {/* User + logout */}
                <div className="border-t border-slate-100 p-3">
                    <div className="mb-2 flex items-center gap-3 px-3 py-2">
                        {session.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={session.user.image}
                                alt={session.user.name ?? ""}
                                className="h-7 w-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                                {session.user.name?.[0]?.toUpperCase() ?? "A"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-900">
                                {session.user.name ?? "Admin"}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                                {session.user.email}
                            </p>
                        </div>
                    </div>

                    {/* Logout — Server Action, no client JS needed */}
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* ── Main ────────────────────────────────────────────────── */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Topbar */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        {/* Breadcrumb injected per-page via slot or hardcoded */}
                        <span>Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {session.user.role}
                        </span>
                        <span className="text-sm text-slate-600">{session.user.name}</span>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}