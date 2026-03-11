"use client"

import { useState } from "react"
import { X, MapPin, Package, Tag, User, ZoomIn } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface OrderDetailDrawerProps {
    order: any
    statusStyles: Record<string, string>
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            <div
                className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: "80vh" }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={500}
                    height={500}
                    className="object-contain w-full h-full"
                    style={{ maxHeight: "80vh" }}
                />
            </div>
            <p className="absolute bottom-6 text-white/40 text-xs">Click anywhere to close</p>
        </div>
    )
}

function ItemRow({ item }: { item: any }) {
    const [imgError, setImgError] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const image = item.product?.images?.[0]
    const total = (item.quantity * Number(item.price)).toFixed(2)

    return (
        <>
            {lightboxOpen && image && !imgError && (
                <ImageLightbox
                    src={image}
                    alt={item.product?.name ?? "Product"}
                    onClose={() => setLightboxOpen(false)}
                />
            )}

            <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                {/* Product image — clickable */}
                <div
                    className={`h-14 w-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group ${image && !imgError ? "cursor-zoom-in" : ""}`}
                    onClick={() => image && !imgError && setLightboxOpen(true)}
                >
                    {image && !imgError ? (
                        <>
                            <Image
                                src={image}
                                alt={item.product?.name ?? "Product"}
                                width={56}
                                height={56}
                                className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
                                onError={() => setImgError(true)}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                                <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-300" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.product?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                    {item.product?.category?.name && (
                        <span className="inline-block mt-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {item.product.category.name}
                        </span>
                    )}
                </div>

                <span className="text-sm font-bold text-slate-900 shrink-0">${total}</span>
            </div>
        </>
    )
}

export function OrderDetailDrawer({ order, statusStyles }: OrderDetailDrawerProps) {
    const [open, setOpen] = useState(false)
    const address = order.address ?? order.shippingAddress ?? order.deliveryAddress ?? null

    return (
        <>
            <button onClick={() => setOpen(true)} className="text-xs font-medium text-[#4A6CF7] hover:underline">
                View
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />

                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-slate-900">Order Details</h2>
                                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[280px]">{order.id}</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">

                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyles[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                                    {order.status}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" /> Customer
                                </h3>
                                <p className="text-sm font-semibold text-slate-900">{order.user?.name ?? "—"}</p>
                                <p className="text-xs text-slate-500">{order.user?.email}</p>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" /> Delivery Address
                                </h3>
                                {address ? (
                                    <div className="space-y-0.5 mt-1">
                                        {address.fullName && <p className="text-sm font-semibold text-slate-900">{address.fullName}</p>}
                                        {address.phone && <p className="text-xs text-slate-500">{address.phone}</p>}
                                        {address.street && <p className="text-xs text-slate-500">{address.street}</p>}
                                        {(address.city || address.state || address.zip) && (
                                            <p className="text-xs text-slate-500">{[address.city, address.state, address.zip].filter(Boolean).join(", ")}</p>
                                        )}
                                        {address.country && <p className="text-xs text-slate-500">{address.country}</p>}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic mt-1">No address provided (store pickup)</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                    <Package className="h-3.5 w-3.5" /> Items ({order.items?.length ?? 0})
                                </h3>
                                <div>
                                    {order.items?.map((item: any) => <ItemRow key={item.id} item={item} />)}
                                </div>
                            </div>

                            {order.coupon && (
                                <div className="rounded-xl border border-green-100 bg-green-50 p-4 space-y-1">
                                    <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" /> Coupon Applied
                                    </h3>
                                    <p className="text-sm font-semibold text-green-700">{order.coupon.code}</p>
                                    <p className="text-xs text-green-600">
                                        {order.coupon.discountType === "PERCENTAGE" ? `${order.coupon.discountValue}% off` : `$${order.coupon.discountValue} off`}
                                    </p>
                                </div>
                            )}

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900">Order Total</span>
                                    <span className="text-lg font-bold text-slate-900">${Number(order.total).toFixed(2)}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </>
    )
}