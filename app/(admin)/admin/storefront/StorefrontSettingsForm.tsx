"use client"

import { useState, useTransition } from "react"
import { updateShopSettings } from "@/features/storefront/actions/storefront.actions"
import { Save, ImageIcon, Type, Megaphone, ExternalLink, CheckCircle2, AlertCircle, Store, Plus, Trash2, Radio, LayoutGrid, Eye, EyeOff, Layers, Tag, Link2 } from "lucide-react"

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Icon size={15} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
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

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"

export default function StorefrontSettingsForm({ initialData }: { initialData: any }) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const [form, setForm] = useState({
        heroImageUrl: initialData?.heroImageUrl ?? "",
        heroTitle: initialData?.heroTitle ?? "",
        heroSubtitle: initialData?.heroSubtitle ?? "",
        heroButtonText: initialData?.heroButtonText ?? "",
        heroButtonLink: initialData?.heroButtonLink ?? "",
        isBannerVisible: initialData?.isBannerVisible ?? false,
        bannerText: initialData?.bannerText ?? "",
        bannerBgColor: initialData?.bannerBgColor ?? "#fff7ed",
        bannerTextColor: initialData?.bannerTextColor ?? "#92400e",
        announcementSlides: initialData?.announcementSlides ?? [{ text: "", link: "", linkLabel: "" }],
        announcementBgColor: initialData?.announcementBgColor ?? "#18181b",
        announcementTextColor: initialData?.announcementTextColor ?? "#ffffff",
        // Hero controls
        heroTagline: initialData?.heroTagline ?? "New Arrivals",
        heroVisible: initialData?.heroVisible ?? true,
        heroShowProduct: initialData?.heroShowProduct ?? true,
        // Categories page
        catHeroTitle: initialData?.catHeroTitle ?? "Shop By Category.",
        catHeroSubtitle: initialData?.catHeroSubtitle ?? "Find exactly what you're looking for across our full range of premium mobile accessories and gadgets.",
        catHeroBadgeLabel: initialData?.catHeroBadgeLabel ?? "Browse All",
        catHeroVisible: initialData?.catHeroVisible ?? true,
        catTrustVisible: initialData?.catTrustVisible ?? true,
        catTrustItems: initialData?.catTrustItems ?? [
            { icon: "Package", title: "Curated Collection", sub: "Handpicked premium items" },
            { icon: "Truck", title: "Fast Shipping", sub: "Quick nationwide delivery" },
            { icon: "ShieldCheck", title: "Genuine Quality", sub: "Original products only" },
        ],
        catGridTitle: initialData?.catGridTitle ?? "Explore Categories",
        catGridSubtitle: initialData?.catGridSubtitle ?? "Choose a category to discover our carefully curated products",
        catCtaVisible: initialData?.catCtaVisible ?? true,
        catCtaHeadline: initialData?.catCtaHeadline ?? "Can't find what you're looking for?",
        catCtaSubtext: initialData?.catCtaSubtext ?? "Browse all products in our shop",
        catCtaButtonLabel: initialData?.catCtaButtonLabel ?? "View All Products",
        catCtaButtonLink: initialData?.catCtaButtonLink ?? "/shop",
        // Bento grid
        bentoCategoryTitle: initialData?.bentoCategoryTitle ?? "SHOP BY CATEGORY",
        bentoCategorySubtitle: initialData?.bentoCategorySubtitle ?? "Curated collections for your tech.",
        bentoSectionVisible: initialData?.bentoSectionVisible ?? true,
        bentoHotDealsLabel: initialData?.bentoHotDealsLabel ?? "HOT DEALS",
        bentoHotDealsTag: initialData?.bentoHotDealsTag ?? "Most Popular",
        bentoHotDealsLink: initialData?.bentoHotDealsLink ?? "/shop?sort=best-sellers",
        bentoHotDealsVisible: initialData?.bentoHotDealsVisible ?? true,
        bentoBestSellersLabel: initialData?.bentoBestSellersLabel ?? "BEST SELLERS",
        bentoBestSellersTag: initialData?.bentoBestSellersTag ?? "Top Rated",
        bentoBestSellersLink: initialData?.bentoBestSellersLink ?? "/shop?sort=best-sellers",
        bentoBestSellersVisible: initialData?.bentoBestSellersVisible ?? true,
        bentoNewArrivalsLabel: initialData?.bentoNewArrivalsLabel ?? "NEW ARRIVALS",
        bentoNewArrivalsLink: initialData?.bentoNewArrivalsLink ?? "/shop?sort=newest",
        bentoNewArrivalsVisible: initialData?.bentoNewArrivalsVisible ?? true,
    })

    const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

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

            {/* ── Hero Image ─────────────────────────────── */}
            <Section icon={ImageIcon} title="Hero Image">
                <Field
                    label="Image URL"
                    hint="Paste a direct image URL from Cloudinary, Imgur, or any CDN. Recommended: 1600×900px."
                >
                    <input
                        type="url"
                        value={form.heroImageUrl}
                        onChange={e => set("heroImageUrl", e.target.value)}
                        placeholder="https://res.cloudinary.com/your-cloud/image/upload/your-image.jpg"
                        className={inputCls}
                    />
                </Field>

                {form.heroImageUrl && (
                    <div className="relative h-44 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={form.heroImageUrl}
                            alt="Hero preview"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => (e.currentTarget.style.display = "none")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end p-4">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Preview</span>
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Hero Text & CTA ────────────────────────── */}
            <Section icon={Type} title="Hero Text & Button">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Headline">
                        <input
                            type="text"
                            value={form.heroTitle}
                            onChange={e => set("heroTitle", e.target.value)}
                            placeholder="Own Your Identity."
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Subtitle">
                        <input
                            type="text"
                            value={form.heroSubtitle}
                            onChange={e => set("heroSubtitle", e.target.value)}
                            placeholder="Handcrafted cases. Limited drops."
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Button Label">
                        <input
                            type="text"
                            value={form.heroButtonText}
                            onChange={e => set("heroButtonText", e.target.value)}
                            placeholder="Shop Now"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Button Link">
                        <div className="relative">
                            <ExternalLink size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={form.heroButtonLink}
                                onChange={e => set("heroButtonLink", e.target.value)}
                                placeholder="/shop"
                                className={`${inputCls} pl-9`}
                            />
                        </div>
                    </Field>
                </div>
            </Section>

            {/* ── Announcement Banner ────────────────────── */}
            <Section icon={Megaphone} title="Announcement Banner">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Show banner on shop page</p>
                        <p className="text-xs text-slate-400 mt-0.5">Appears above the product grid</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => set("isBannerVisible", !form.isBannerVisible)}
                        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.isBannerVisible ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                    >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.isBannerVisible ? "translate-x-5" : "translate-x-0.5"
                            }`} />
                    </button>
                </div>

                {form.isBannerVisible && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <Field label="Banner Text">
                            <input
                                type="text"
                                value={form.bannerText}
                                onChange={e => set("bannerText", e.target.value)}
                                placeholder="🔥 Only 3 left! New designs dropping in 12h 👀"
                                className={inputCls}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Background Color">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={form.bannerBgColor}
                                        onChange={e => set("bannerBgColor", e.target.value)}
                                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={form.bannerBgColor}
                                        onChange={e => set("bannerBgColor", e.target.value)}
                                        className={`${inputCls} font-mono text-xs`}
                                    />
                                </div>
                            </Field>
                            <Field label="Text Color">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={form.bannerTextColor}
                                        onChange={e => set("bannerTextColor", e.target.value)}
                                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={form.bannerTextColor}
                                        onChange={e => set("bannerTextColor", e.target.value)}
                                        className={`${inputCls} font-mono text-xs`}
                                    />
                                </div>
                            </Field>
                        </div>

                        {/* Live banner preview */}
                        <div
                            className="w-full py-2.5 px-6 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: form.bannerBgColor, color: form.bannerTextColor }}
                        >
                            {form.bannerText || "Your banner will appear here"}
                        </div>
                    </div>
                )}
            </Section>


            {/* ── Announcement Bar Slides ──────────────── */}
            <Section icon={Radio} title="Announcement Bar Slides">
                <p className="text-xs text-slate-400">Add up to 4 rotating messages shown above the navbar. Leave empty to hide the bar.</p>
                <div className="space-y-3">
                    {form.announcementSlides.map((slide: any, i: number) => (
                        <div key={i} className="grid grid-cols-1 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-5">{i + 1}</span>
                                <input
                                    type="text"
                                    value={slide.text}
                                    onChange={e => {
                                        const slides = [...form.announcementSlides]
                                        slides[i] = { ...slides[i], text: e.target.value }
                                        set("announcementSlides", slides)
                                    }}
                                    placeholder="🎉 Free shipping on orders over 10 BHD!"
                                    className={inputCls + " flex-1"}
                                />
                                {form.announcementSlides.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => set("announcementSlides", form.announcementSlides.filter((_: any, j: number) => j !== i))}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pl-7">
                                <input
                                    type="text"
                                    value={slide.linkLabel}
                                    onChange={e => {
                                        const slides = [...form.announcementSlides]
                                        slides[i] = { ...slides[i], linkLabel: e.target.value }
                                        set("announcementSlides", slides)
                                    }}
                                    placeholder="Link label (e.g. Shop Now)"
                                    className={inputCls}
                                />
                                <input
                                    type="text"
                                    value={slide.link}
                                    onChange={e => {
                                        const slides = [...form.announcementSlides]
                                        slides[i] = { ...slides[i], link: e.target.value }
                                        set("announcementSlides", slides)
                                    }}
                                    placeholder="URL (e.g. /shop)"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    ))}
                    {/* Bar colors */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <Field label="Bar Background Color">
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={form.announcementBgColor}
                                    onChange={e => set("announcementBgColor", e.target.value)}
                                    className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0"
                                />
                                <input
                                    type="text"
                                    value={form.announcementBgColor}
                                    onChange={e => set("announcementBgColor", e.target.value)}
                                    className={inputCls + " font-mono text-xs"}
                                />
                            </div>
                        </Field>
                        <Field label="Bar Text Color">
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={form.announcementTextColor}
                                    onChange={e => set("announcementTextColor", e.target.value)}
                                    className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-1 shrink-0"
                                />
                                <input
                                    type="text"
                                    value={form.announcementTextColor}
                                    onChange={e => set("announcementTextColor", e.target.value)}
                                    className={inputCls + " font-mono text-xs"}
                                />
                            </div>
                        </Field>
                    </div>

                    {/* Live preview */}
                    <div
                        className="w-full py-2 px-4 rounded-xl flex items-center justify-center text-sm font-medium gap-2"
                        style={{ backgroundColor: form.announcementBgColor, color: form.announcementTextColor }}
                    >
                        <span>←</span>
                        <span>{form.announcementSlides[0]?.text || "Your announcement text here"}</span>
                        {form.announcementSlides[0]?.linkLabel && (
                            <span className="font-black underline">{form.announcementSlides[0].linkLabel}</span>
                        )}
                        <span>→</span>
                    </div>

                    {form.announcementSlides.length < 4 && (
                        <button
                            type="button"
                            onClick={() => set("announcementSlides", [...form.announcementSlides, { text: "", link: "", linkLabel: "" }])}
                            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            <Plus size={14} /> Add slide
                        </button>
                    )}
                </div>
            </Section>

            {/* ── Hero Visibility Controls ──────────────── */}
            <Section icon={Eye} title="Hero Section Controls">
                <div className="space-y-4">
                    {[
                        { key: "heroVisible", label: "Show Hero Section", sub: "Toggle the entire hero section on/off" },
                        { key: "heroShowProduct", label: "Show Product Image", sub: "Display a featured product in the hero" },
                    ].map(({ key, label, sub }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                            </div>
                            <button type="button" onClick={() => set(key, !(form as any)[key])}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${(form as any)[key] ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${(form as any)[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                    ))}
                    <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Tagline Badge" hint="Small badge above the headline (e.g. 'New Arrivals')">
                            <input type="text" value={form.heroTagline} onChange={e => set("heroTagline", e.target.value)}
                                placeholder="New Arrivals" className={inputCls} />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* ── Bento Grid Controls ────────────────────── */}
            <Section icon={LayoutGrid} title="Bento Category Grid">
                <div className="space-y-6">

                    {/* Section heading */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-slate-700">Section Heading</p>
                            <button type="button" onClick={() => set("bentoSectionVisible", !form.bentoSectionVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.bentoSectionVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.bentoSectionVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Title">
                                <input type="text" value={form.bentoCategoryTitle} onChange={e => set("bentoCategoryTitle", e.target.value)}
                                    placeholder="SHOP BY CATEGORY" className={inputCls} />
                            </Field>
                            <Field label="Subtitle">
                                <input type="text" value={form.bentoCategorySubtitle} onChange={e => set("bentoCategorySubtitle", e.target.value)}
                                    placeholder="Curated collections for your tech." className={inputCls} />
                            </Field>
                        </div>
                    </div>

                    {/* Hot Deals card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-orange-100 flex items-center justify-center">
                                    <Tag size={12} className="text-orange-500" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800">Hot Deals Card (Big)</p>
                            </div>
                            <button type="button" onClick={() => set("bentoHotDealsVisible", !form.bentoHotDealsVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.bentoHotDealsVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.bentoHotDealsVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Field label="Heading">
                                <input type="text" value={form.bentoHotDealsLabel} onChange={e => set("bentoHotDealsLabel", e.target.value)} placeholder="HOT DEALS" className={inputCls} />
                            </Field>
                            <Field label="Tag">
                                <input type="text" value={form.bentoHotDealsTag} onChange={e => set("bentoHotDealsTag", e.target.value)} placeholder="Most Popular" className={inputCls} />
                            </Field>
                            <Field label="Link">
                                <input type="text" value={form.bentoHotDealsLink} onChange={e => set("bentoHotDealsLink", e.target.value)} placeholder="/shop?sort=best-sellers" className={inputCls} />
                            </Field>
                        </div>
                    </div>

                    {/* Best Sellers card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-yellow-100 flex items-center justify-center">
                                    <Tag size={12} className="text-yellow-500" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800">Best Sellers Card (Wide)</p>
                            </div>
                            <button type="button" onClick={() => set("bentoBestSellersVisible", !form.bentoBestSellersVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.bentoBestSellersVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.bentoBestSellersVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Field label="Heading">
                                <input type="text" value={form.bentoBestSellersLabel} onChange={e => set("bentoBestSellersLabel", e.target.value)} placeholder="BEST SELLERS" className={inputCls} />
                            </Field>
                            <Field label="Tag">
                                <input type="text" value={form.bentoBestSellersTag} onChange={e => set("bentoBestSellersTag", e.target.value)} placeholder="Top Rated" className={inputCls} />
                            </Field>
                            <Field label="Link">
                                <input type="text" value={form.bentoBestSellersLink} onChange={e => set("bentoBestSellersLink", e.target.value)} placeholder="/shop?sort=best-sellers" className={inputCls} />
                            </Field>
                        </div>
                    </div>

                    {/* New Arrivals card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-slate-200 flex items-center justify-center">
                                    <Tag size={12} className="text-slate-500" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800">New Arrivals Card (Square)</p>
                            </div>
                            <button type="button" onClick={() => set("bentoNewArrivalsVisible", !form.bentoNewArrivalsVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.bentoNewArrivalsVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.bentoNewArrivalsVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Heading">
                                <input type="text" value={form.bentoNewArrivalsLabel} onChange={e => set("bentoNewArrivalsLabel", e.target.value)} placeholder="NEW ARRIVALS" className={inputCls} />
                            </Field>
                            <Field label="Link">
                                <input type="text" value={form.bentoNewArrivalsLink} onChange={e => set("bentoNewArrivalsLink", e.target.value)} placeholder="/shop?sort=newest" className={inputCls} />
                            </Field>
                        </div>
                    </div>

                </div>
            </Section>

            {/* ── Categories Page ───────────────────────── */}
            <Section icon={Layers} title="Categories Page">
                <div className="space-y-6">

                    {/* Hero */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">Hero Section</p>
                            <button type="button" onClick={() => set("catHeroVisible", !form.catHeroVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.catHeroVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.catHeroVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Badge Label">
                                <input type="text" value={form.catHeroBadgeLabel} onChange={e => set("catHeroBadgeLabel", e.target.value)}
                                    placeholder="Browse All" className={inputCls} />
                            </Field>
                            <Field label="Headline">
                                <input type="text" value={form.catHeroTitle} onChange={e => set("catHeroTitle", e.target.value)}
                                    placeholder="Shop By Category." className={inputCls} />
                            </Field>
                        </div>
                        <Field label="Subtitle">
                            <input type="text" value={form.catHeroSubtitle} onChange={e => set("catHeroSubtitle", e.target.value)}
                                placeholder="Find exactly what you're looking for..." className={inputCls} />
                        </Field>
                        {/* Live preview */}
                        <div className="rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-200 px-6 py-8 text-center space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-300 bg-white/60 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                ⊞ {form.catHeroBadgeLabel || "Browse All"}
                            </span>
                            <p className="text-2xl font-black uppercase text-zinc-800 leading-tight">{form.catHeroTitle || "Shop By Category."}</p>
                            <p className="text-xs text-zinc-500 max-w-xs mx-auto">{form.catHeroSubtitle || "Subtitle goes here..."}</p>
                        </div>
                    </div>

                    {/* Trust Bar */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">Trust Bar (3 badges)</p>
                            <button type="button" onClick={() => set("catTrustVisible", !form.catTrustVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.catTrustVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.catTrustVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.catTrustItems.map((item: any, i: number) => (
                                <div key={i} className="grid grid-cols-2 gap-2">
                                    <input type="text" value={item.title}
                                        onChange={e => { const a = [...form.catTrustItems]; a[i] = { ...a[i], title: e.target.value }; set("catTrustItems", a) }}
                                        placeholder="Badge title" className={inputCls} />
                                    <input type="text" value={item.sub}
                                        onChange={e => { const a = [...form.catTrustItems]; a[i] = { ...a[i], sub: e.target.value }; set("catTrustItems", a) }}
                                        placeholder="Badge subtitle" className={inputCls} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid Heading */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <p className="text-sm font-semibold text-slate-800">Category Grid Heading</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Title">
                                <input type="text" value={form.catGridTitle} onChange={e => set("catGridTitle", e.target.value)}
                                    placeholder="Explore Categories" className={inputCls} />
                            </Field>
                            <Field label="Subtitle">
                                <input type="text" value={form.catGridSubtitle} onChange={e => set("catGridSubtitle", e.target.value)}
                                    placeholder="Choose a category..." className={inputCls} />
                            </Field>
                        </div>
                    </div>

                    {/* CTA Banner */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">Bottom CTA Banner</p>
                            <button type="button" onClick={() => set("catCtaVisible", !form.catCtaVisible)}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.catCtaVisible ? "bg-emerald-500" : "bg-slate-200"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.catCtaVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Headline">
                                <input type="text" value={form.catCtaHeadline} onChange={e => set("catCtaHeadline", e.target.value)}
                                    placeholder="Can't find what you're looking for?" className={inputCls} />
                            </Field>
                            <Field label="Subtext">
                                <input type="text" value={form.catCtaSubtext} onChange={e => set("catCtaSubtext", e.target.value)}
                                    placeholder="Browse all products in our shop" className={inputCls} />
                            </Field>
                            <Field label="Button Label">
                                <input type="text" value={form.catCtaButtonLabel} onChange={e => set("catCtaButtonLabel", e.target.value)}
                                    placeholder="View All Products" className={inputCls} />
                            </Field>
                            <Field label="Button Link">
                                <input type="text" value={form.catCtaButtonLink} onChange={e => set("catCtaButtonLink", e.target.value)}
                                    placeholder="/shop" className={inputCls} />
                            </Field>
                        </div>
                        {/* Live preview */}
                        <div className="rounded-xl bg-zinc-900 px-6 py-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-bold text-sm">{form.catCtaHeadline || "CTA Headline"}</p>
                                <p className="text-zinc-400 text-xs mt-0.5">{form.catCtaSubtext || "Subtext here"}</p>
                            </div>
                            <span className="shrink-0 text-xs font-bold bg-white text-zinc-900 px-4 py-2 rounded-full">
                                {form.catCtaButtonLabel || "Button"}
                            </span>
                        </div>
                    </div>

                </div>
            </Section>

            {/* ── Profile Banners ───────────────────────────────── */}
            <Section icon={ImageIcon} title="Profile Banners">
                <Field label="Card Tagline" hint="Shown below the user's email on their profile banner card">
                    <input
                        type="text"
                        value={form.profileCardTagline}
                        onChange={e => set("profileCardTagline", e.target.value)}
                        placeholder="Shbash Member"
                        className={inputCls}
                    />
                </Field>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Banner Images</p>
                        <button
                            type="button"
                            onClick={() => {
                                const banners = [...(form.profileBannerImages as any[])]
                                banners.push({ id: `img-${Date.now()}`, url: "", label: "" })
                                set("profileBannerImages", banners)
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            <Plus size={13} /> Add Image
                        </button>
                    </div>
                    <p className="text-xs text-slate-400">Paste image URLs (Cloudinary, imgbb, etc). Users see these in their banner picker under the "Images" tab.</p>

                    {(form.profileBannerImages as any[]).length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                            <ImageIcon className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-400 font-medium">No banner images yet</p>
                            <p className="text-xs text-slate-300 mt-0.5">Click "Add Image" to add your first banner</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {(form.profileBannerImages as any[]).map((banner: any, i: number) => (
                            <div key={banner.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                                <div className="flex gap-3 p-3">
                                    {/* Preview */}
                                    <div className="h-16 w-24 rounded-lg overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                                        {banner.url ? (
                                            <img src={banner.url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Fields */}
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <input
                                            type="text"
                                            value={banner.url}
                                            onChange={e => {
                                                const banners = [...(form.profileBannerImages as any[])]
                                                banners[i] = { ...banners[i], url: e.target.value }
                                                set("profileBannerImages", banners)
                                            }}
                                            placeholder="https://res.cloudinary.com/..."
                                            className={inputCls + " text-xs"}
                                        />
                                        <input
                                            type="text"
                                            value={banner.label}
                                            onChange={e => {
                                                const banners = [...(form.profileBannerImages as any[])]
                                                banners[i] = { ...banners[i], label: e.target.value }
                                                set("profileBannerImages", banners)
                                            }}
                                            placeholder="Label (e.g. Desert Dunes)"
                                            className={inputCls + " text-xs"}
                                        />
                                    </div>
                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() => set("profileBannerImages", (form.profileBannerImages as any[]).filter((_: any, j: number) => j !== i))}
                                        className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0 mt-0.5"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── Save ──────────────────────────────────── */}
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
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    <Save size={15} />
                    {isPending ? "Saving…" : "Save Changes"}
                </button>
            </div>

        </div>
    )
}