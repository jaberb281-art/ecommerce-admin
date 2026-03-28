"use client"

import { useState, useTransition } from "react"
import { updateShopSettings } from "@/features/storefront/actions/storefront.actions"
import { Save, ImageIcon, Type, Megaphone, ExternalLink, CheckCircle2, AlertCircle, Store, Plus, Trash2, Radio } from "lucide-react"

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