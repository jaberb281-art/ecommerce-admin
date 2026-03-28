"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ShoppingBag, Bell, Search, MapPin, Menu, X, LogOut, Loader2 } from "lucide-react"
import { api, authApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import SearchOverlay from "@/components/shop/search-overlay"

function getInitials(name: string) {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"
}

const NAV_LINKS = [
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Events", href: "/events" },
    { label: "About Us", href: "/about" },
]

interface StoreHeaderProps {
    onOpenCart: () => void
}

export default function StoreHeader({ onOpenCart }: StoreHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Fetch Cart Data
    const { data: cart } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const { data } = await api.get("/cart")
            return data
        },
        retry: false,
    })

    // Fetch Unread Notifications
    const { data: unreadCount } = useQuery({
        queryKey: ["unread-count"],
        queryFn: async () => {
            const { data } = await api.get("/notifications/unread-count")
            return data
        },
        retry: false,
    })

    // Fetch User Session from our new Proxy Route
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const { data } = await api.get("/auth/me")
            return data
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // Keep session valid for 5 mins
    })

    async function handleLogout() {
        try {
            // This calls your /api/auth/logout route to clear cookies
            await authApi.post("/auth/logout")
            queryClient.clear()
            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    const cartCount = cart?.items?.length ?? 0
    const notifications = unreadCount?.count ?? 0

    return (
        <>
            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

            <header className="w-full transition-all duration-500 ease-in-out">
                <div
                    className={cn(
                        "mx-auto max-w-7xl transition-all duration-500 rounded-full border flex items-center gap-4",
                        isScrolled
                            ? "bg-background/80 backdrop-blur-xl border-border py-2.5 px-6 shadow-sm"
                            : "bg-transparent border-transparent py-4 px-4"
                    )}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <span className="text-2xl font-bold text-primary text-gray-400 mt-1 transition-transform duration-300 group-hover:scale-110">
                            شبش
                        </span>
                        <span className="hidden lg:block font-display text-xl font-bold tracking-tighter text-foreground">
                            SHBASH<span className="text-primary italic">.</span>
                        </span>
                    </Link>

                    {/* Location Pill */}
                    <div className="hidden xl:flex items-center gap-1.5 bg-muted border border-border rounded-full px-3 py-1.5">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-gray-400 mt-1">Bahrain</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-2 ml-4">
                        {NAV_LINKS.map(({ label, href }) => {
                            const active = pathname === href || (href !== "/" && pathname.startsWith(href))
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full",
                                        active
                                            ? "text-primary bg-primary/5"
                                            : "text-muted-foreground hover:text-primary hover:bg-muted"
                                    )}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-3 ml-auto">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden md:flex items-center gap-3 w-40 lg:w-64 rounded-full bg-muted border border-border px-4 py-2 text-xs text-muted-foreground hover:border-primary/40 transition-all duration-300 group"
                        >
                            <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                            <span>Search...</span>
                        </button>

                        <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                            <Bell size={20} strokeWidth={2} />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-[9px] font-black text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                                    {notifications > 9 ? "9+" : notifications}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={onOpenCart}
                            className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ShoppingBag size={20} strokeWidth={2} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-[9px] font-black text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>

                        {/* User Profile / Login */}
                        <div className="flex items-center gap-2 ml-2">
                            {userLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : user ? (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/profile"
                                        className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-primary/20 hover:scale-110 transition-transform bg-primary"
                                    >
                                        {getInitials(user.name || user.email)}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="hidden lg:block text-muted-foreground hover:text-destructive transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="rounded-full bg-primary px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        <button
                            className="md:hidden p-2 text-foreground ml-1"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <div className="text-2xl font-bold tracking-widest">
                                •••
                            </div>                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu — full screen editorial */}
            <div
                className={cn(
                    "fixed inset-0 z-[50] bg-background flex flex-col transition-all duration-500 md:hidden",
                    mobileMenuOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                )}
            >
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tighter text-foreground">
                        شبش
                    </Link>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false) }} className="p-2 text-muted-foreground">
                            <Search size={20} />
                        </button>
                        <button onClick={onOpenCart} className="relative p-2 text-muted-foreground">
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 bg-foreground text-[9px] font-black text-background rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-muted-foreground"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-6">
                    {NAV_LINKS.map(({ label, href }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href))
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center justify-between py-6 border-b border-border group transition-colors",
                                    active ? "text-primary" : "text-foreground"
                                )}
                            >
                                <span className="text-3xl font-bold tracking-tight">{label}</span>
                                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform text-xl">→</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom: user section */}
                <div className="px-6 pb-10 pt-6 border-t border-border shrink-0 space-y-3">
                    {user ? (
                        <div className="flex items-center justify-between">
                            <Link
                                href="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3"
                            >
                                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                                    {getInitials(user.name || user.email)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{user.name ?? user.email}</p>
                                    <p className="text-xs text-muted-foreground">View Profile</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-center py-4 rounded-full bg-foreground text-background font-bold text-sm tracking-widest uppercase"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}