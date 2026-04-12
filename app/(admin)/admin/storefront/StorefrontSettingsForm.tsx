"use client"

import { useState, useTransition } from "react"
import { updateShopSettings } from "@/features/storefront/actions/storefront.actions"
import {
    Save, ImageIcon, Type, Megaphone, ExternalLink, CheckCircle2, AlertCircle,
    Plus, Trash2, Radio, LayoutGrid, Eye, EyeOff, Tag, Zap
} from "lucide-react"

// ── Shared UI helpers ────────────────────────────────────────────────────────

function Section({ icon: Icon, title, subtitle, children }: {
    icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Icon size={15} className="text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</label>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {children}
        </div>
    )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
        <button type="button" onClick={onChange}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
    )
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"

// ── Default values ────────────────────────────────────────────────────────────

const defaultGrid = [
    { id: "hot-deals", label: "HOT DEALS", badge: "% MOST POPULAR", link: "/shop", imageUrl: "", size: "large" },
    { id: "best-sellers", label: "BEST SELLERS", badge: "⭐ TOP RATED", link: "/shop", imageUrl: "", size: "large" },
    { id: "new-arrivals", label: "NEW ARRIVALS", badge: "", link: "/shop", imageUrl: "", size: "medium" },
    { id: "all-categories", label: "ALL CATEGORIES", badge: "CURATED", link: "/categories", imageUrl: "", size: "medium" },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function StorefrontSettingsForm({ initialData }: { initialData: any }) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const [form, setForm] = useState({
        // Hero image
        heroImageUrl: initialData?.heroImageUrl ?? "",
        // Hero text
        heroTitle: initialData?.heroTitle ?? "",
        heroSubtitle: initialData?.heroSubtitle ?? "",
        heroButtonText: initialData?.heroButtonText ?? "",
        heroButtonLink: initialData?.heroButtonLink ?? "",
        // Hero controls
        heroTagline: initialData?.heroTagline ?? "New Arrivals",
        heroVisible: initialData?.heroVisible ?? true,
        heroShowProduct: initialData?.heroShowProduct ?? true,
        // Bento section
        bentoCategoryTitle: initialData?.bentoCategoryTitle ?? "SHOP BY CATEGORY",
        bentoCategorySubtitle: initialData?.bentoCategorySubtitle ?? "Curated collections for your tech.",
        bentoSectionVisible: initialData?.bentoSectionVisible ?? true,
        categoryGrid: initialData?.categoryGrid ?? defaultGrid,
        // Shop page banner
        isBannerVisible: initialData?.isBannerVisible ?? false,
        bannerText: initialData?.bannerText ?? "",
        bannerBgColor: initialData?.bannerBgColor ?? "#fff7ed",
        bannerTextColor: initialData?.bannerTextColor ?? "#92400e",
        // Announcement ticker
        announcementSlides: initialData?.announcementSlides ?? [{ text: "", link: "", linkLabel: "" }],
        announcementBgColor: initialData?.announcementBgColor ?? "#18181b",
        announcementTextColor: initialData?.announcementTextColor ?? "#ffffff",
    })

    const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    // Grid helpers
    function setTile(index: number, field: string, value: string) {
        set("categoryGrid", form.categoryGrid.map((t: any, i: number) => i === index ? { ...t, [field]: value } : t))
    }
    function addTile() {
        if (form.categoryGrid.length >= 6) return
        set("categoryGrid", [...form.categoryGrid, { id: `tile-${Date.now()}`, label: "", badge: "", link: "/shop", imageUrl: "", size: "medium" }])
    }
    function removeTile(index: number) {
        set("categoryGrid", form.categoryGrid.filter((_: any, i: number) => i !== index))
    }

    // Slide helpers
    function setSlide(i: number, field: string, value: string) {
        const slides = [...form.announcementSlides]
        slides[i] = { ...slides[i], [field]: value }
        set("announcementSlides", slides)
    }
    function removeSlide(i: number) {
        set("announcementSlides", form.announcementSlides.filter((_: any, j: number) => j !== i))
    }

    function handleSave() {
        startTransition(async () => {
            const result = await updateShopSettings(form)
            if (result.success) {
                setStatus("saved")
                setTimeout(() => setStatus("idle"), 2500)
            } else {
                setErrorMsg(typeof result.error === "string" ? result.error : "Save failed")
                setStatus("error")
                setTimeout(() => setStatus("idle"), 3000)
            }
        })
    }

    return (
        <div className="space-y-6">

            {/* ── 1. Scrolling Announcement Ticker ─────────── */}
            <Section icon={Radio} title="Scrolling Announcement Ticker"
                subtitle="Text that scrolls across the top of every page">
                <p className="text-xs text-slate-400">Add up to 4 messages. They'll scroll continuously. Leave empty to hide the bar entirely.</p>

                {/* Live preview */}
                <div className="relative overflow-hidden rounded-xl border border-slate-200"
                    style={{ backgroundColor: form.announcementBgColor, height: "36px" }}>
                    <div className="flex items-center h-full whitespace-nowrap px-4 gap-6 text-xs font-medium"
                        style={{ color: form.announcementTextColor }}>
                        {form.announcementSlides.filter((s: any) => s.text).map((s: any, i: number) => (
                            <span key={i} className="flex items-center gap-2 shrink-0">
                                <span className="opacity-90">{s.text}</span>
                                {s.linkLabel && <span className="font-black underline opacity-80">{s.linkLabel}</span>}
                                <span className="opacity-30">✦</span>
                            </span>
                        ))}
                        {form.announcementSlides.filter((s: any) => s.text).length === 0 && (
                            <span className="opacity-40">Your scrolling text will appear here…</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {form.announcementSlides.map((slide: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-5">{i + 1}</span>
                                <input type="text" value={slide.text}
                                    onChange={e => setSlide(i, "text", e.target.value)}
                                    placeholder="🎉 Free shipping on orders over 10 BHD!"
                                    className={inputCls + " flex-1"} />
                                {form.announcementSlides.length > 1 && (
                                    <button type="button" onClick={() => removeSlide(i)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pl-7">
                                <input type="text" value={slide.linkLabel}
                                    onChange={e => setSlide(i, "linkLabel", e.target.value)}
                                    placeholder="Link label (e.g. Shop Now)"
                                    className={inputCls} />
                                <input type="text" value={slide.link}
                                    onChange={e => setSlide(i, "link", e.target.value)}
                                    placeholder="URL (e.g. /shop)"
                                    className={inputCls} />
                            </div>
                        </div>
                    ))}

                    {form.announcementSlides.length < 4 && (
                        <button type="button"
                            onClick={() => set("announcementSlides", [...form.announcementSlides, { text: "", link: "", linkLabel: "" }])}
                            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                            <Plus size={14} /> Add message
                        </button>
                    )}

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <Field label="Background Color">
                            <div className="flex items-center gap-2">
                                <input type="color" value={form.announcementBgColor}
                                    onChange={e => set("announcementBgColor", e.target.value)}
                                    className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0" />
                                <input type="text" value={form.announcementBgColor}
                                    onChange={e => set("announcementBgColor", e.target.value)}
                                    className={inputCls + " font-mono text-xs"} />
                            </div>
                        </Field>
                        <Field label="Text Color">
                            <div className="flex items-center gap-2">
                                <input type="color" value={form.announcementTextColor}
                                    onChange={e => set("announcementTextColor", e.target.value)}
                                    className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0" />
                                <input type="text" value={form.announcementTextColor}
                                    onChange={e => set("announcementTextColor", e.target.value)}
                                    className={inputCls + " font-mono text-xs"} />
                            </div>
                        </Field>
                    </div>
                </div>
            </Section>

            {/* ── 2. Hero Image ─────────────────────────────── */}
            <Section icon={ImageIcon} title="Hero Image">
                <Field label="Image URL" hint="Paste a direct image URL (Cloudinary, Imgur, CDN). Recommended: 800×800px square for best display.">
                    <input type="url" value={form.heroImageUrl}
                        onChange={e => set("heroImageUrl", e.target.value)}
                        placeholder="https://res.cloudinary.com/your-cloud/image/upload/your-image.jpg"
                        className={inputCls} />
                </Field>
                {form.heroImageUrl && (
                    <div className="relative h-44 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.heroImageUrl} alt="Hero preview"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => (e.currentTarget.style.display = "none")} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end p-4">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Preview</span>
                        </div>
                    </div>
                )}
            </Section>

            {/* ── 3. Hero Text & Controls ───────────────────── */}
            <Section icon={Type} title="Hero Section" subtitle="Headline, subtitle, button, and visibility controls">
                {/* Visibility toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {[
                        { key: "heroVisible", label: "Show Hero", icon: Eye },
                        { key: "heroShowProduct", label: "Show Product Image", icon: ImageIcon },
                    ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Icon size={13} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-700">{label}</span>
                            </div>
                            <Toggle enabled={(form as any)[key]} onChange={() => set(key, !(form as any)[key])} />
                        </div>
                    ))}
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100">
                        <Zap size={13} className="text-slate-400 shrink-0" />
                        <input type="text" value={form.heroTagline}
                            onChange={e => set("heroTagline", e.target.value)}
                            placeholder="New Arrivals"
                            className="text-xs font-semibold text-slate-700 outline-none bg-transparent w-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Headline" hint="Use a newline character ↵ in your text to split into two lines with italic styling below.">
                        <input type="text" value={form.heroTitle}
                            onChange={e => set("heroTitle", e.target.value)}
                            placeholder="DISCOVER THE WORLD OF SHBASH"
                            className={inputCls} />
                    </Field>
                    <Field label="Subtitle">
                        <input type="text" value={form.heroSubtitle}
                            onChange={e => set("heroSubtitle", e.target.value)}
                            placeholder="Exclusive mobile accessories & gadgets."
                            className={inputCls} />
                    </Field>
                    <Field label="Button Label">
                        <input type="text" value={form.heroButtonText}
                            onChange={e => set("heroButtonText", e.target.value)}
                            placeholder="Shop Now"
                            className={inputCls} />
                    </Field>
                    <Field label="Button Link">
                        <div className="relative">
                            <ExternalLink size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" value={form.heroButtonLink}
                                onChange={e => set("heroButtonLink", e.target.value)}
                                placeholder="/shop"
                                className={`${inputCls} pl-9`} />
                        </div>
                    </Field>
                </div>
            </Section>

            {/* ── 4. Bento Category Grid ────────────────────── */}
            <Section icon={LayoutGrid} title="Shop by Category Grid"
                subtitle="Control the bento tiles — images, labels, badges and links">

                {/* Section heading controls */}
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-600">Section heading</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{form.bentoSectionVisible ? "Visible" : "Hidden"}</span>
                        <Toggle enabled={form.bentoSectionVisible} onChange={() => set("bentoSectionVisible", !form.bentoSectionVisible)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <Field label="Title">
                        <input type="text" value={form.bentoCategoryTitle}
                            onChange={e => set("bentoCategoryTitle", e.target.value)}
                            placeholder="SHOP BY CATEGORY" className={inputCls} />
                    </Field>
                    <Field label="Subtitle">
                        <input type="text" value={form.bentoCategorySubtitle}
                            onChange={e => set("bentoCategorySubtitle", e.target.value)}
                            placeholder="Curated collections for your tech." className={inputCls} />
                    </Field>
                </div>

                <p className="text-xs text-slate-400">Each tile needs an image URL, label, optional badge, and a link. First tile = large (left), second = wide (top-right), third + fourth = small squares.</p>

                <div className="space-y-3">
                    {form.categoryGrid.map((tile: any, i: number) => (
                        <div key={tile.id ?? i} className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                                    <span className="text-xs font-semibold text-slate-700">{tile.label || `Tile ${i + 1}`}</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">{tile.size}</span>
                                </div>
                                {form.categoryGrid.length > 2 && (
                                    <button onClick={() => removeTile(i)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Field label="Background Image URL">
                                        <div className="flex gap-2">
                                            <input type="url" value={tile.imageUrl}
                                                onChange={e => setTile(i, "imageUrl", e.target.value)}
                                                placeholder="https://res.cloudinary.com/…"
                                                className={inputCls} />
                                            {tile.imageUrl && (
                                                <div className="h-10 w-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={tile.imageUrl} alt="tile"
                                                        className="w-full h-full object-cover"
                                                        onError={e => (e.currentTarget.style.display = "none")} />
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </div>
                                <Field label="Label">
                                    <input type="text" value={tile.label}
                                        onChange={e => setTile(i, "label", e.target.value)}
                                        placeholder="e.g. HOT DEALS" className={inputCls} />
                                </Field>
                                <Field label="Badge text (optional)">
                                    <input type="text" value={tile.badge}
                                        onChange={e => setTile(i, "badge", e.target.value)}
                                        placeholder="e.g. MOST POPULAR" className={inputCls} />
                                </Field>
                                <Field label="Link destination">
                                    <div className="relative">
                                        <ExternalLink size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={tile.link}
                                            onChange={e => setTile(i, "link", e.target.value)}
                                            placeholder="/shop?category=deals"
                                            className={`${inputCls} pl-9`} />
                                    </div>
                                </Field>
                                <Field label="Display Size">
                                    <select value={tile.size} onChange={e => setTile(i, "size", e.target.value)} className={inputCls}>
                                        <option value="large">Large (tall left card)</option>
                                        <option value="medium">Medium (wide or square)</option>
                                        <option value="small">Small</option>
                                    </select>
                                </Field>
                            </div>
                        </div>
                    ))}
                </div>

                {form.categoryGrid.length < 6 && (
                    <button onClick={addTile}
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors mt-1">
                        <Plus size={14} /> Add tile
                    </button>
                )}

                {/* Grid preview */}
                <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Grid preview</p>
                    <div className="grid grid-cols-4 gap-1.5 h-20">
                        {form.categoryGrid.slice(0, 4).map((tile: any, i: number) => (
                            <div key={i} className="rounded-lg overflow-hidden relative flex items-end p-1.5"
                                style={{
                                    backgroundImage: tile.imageUrl ? `url(${tile.imageUrl})` : undefined,
                                    backgroundSize: "cover", backgroundPosition: "center",
                                    backgroundColor: tile.imageUrl ? undefined : "#e2e8f0",
                                }}>
                                {!tile.imageUrl && <div className="absolute inset-0 flex items-center justify-center"><ImageIcon size={12} className="text-slate-400" /></div>}
                                {tile.imageUrl && <div className="absolute inset-0 bg-black/40 rounded-lg" />}
                                <span className="relative text-[7px] font-black text-white leading-tight">{tile.label || `Tile ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── 5. Shop Page Banner ───────────────────────── */}
            <Section icon={Megaphone} title="Shop Page Banner"
                subtitle="Optional banner shown above the product grid on the shop page">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Show banner on shop page</p>
                        <p className="text-xs text-slate-400 mt-0.5">Appears above the product grid</p>
                    </div>
                    <Toggle enabled={form.isBannerVisible} onChange={() => set("isBannerVisible", !form.isBannerVisible)} />
                </div>

                {form.isBannerVisible && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <Field label="Banner Text">
                            <input type="text" value={form.bannerText}
                                onChange={e => set("bannerText", e.target.value)}
                                placeholder="🔥 Only 3 left! New designs dropping in 12h 👀"
                                className={inputCls} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Background Color">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={form.bannerBgColor}
                                        onChange={e => set("bannerBgColor", e.target.value)}
                                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0" />
                                    <input type="text" value={form.bannerBgColor}
                                        onChange={e => set("bannerBgColor", e.target.value)}
                                        className={`${inputCls} font-mono text-xs`} />
                                </div>
                            </Field>
                            <Field label="Text Color">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={form.bannerTextColor}
                                        onChange={e => set("bannerTextColor", e.target.value)}
                                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0" />
                                    <input type="text" value={form.bannerTextColor}
                                        onChange={e => set("bannerTextColor", e.target.value)}
                                        className={`${inputCls} font-mono text-xs`} />
                                </div>
                            </Field>
                        </div>
                        <div className="w-full py-2.5 px-6 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: form.bannerBgColor, color: form.bannerTextColor }}>
                            {form.bannerText || "Your banner will appear here"}
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Save ─────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                {status === "saved" && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <CheckCircle2 size={15} /> Saved successfully
                    </span>
                )}
                {status === "error" && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                        <AlertCircle size={15} /> {errorMsg || "Save failed"}
                    </span>
                )}
                <button type="button" onClick={handleSave} disabled={isPending}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                    <Save size={15} />
                    {isPending ? "Saving…" : "Save Changes"}
                </button>
            </div>

        </div>
    )
}