import { getShopSettings } from "@/features/storefront/actions/storefront.actions"
import StorefrontSettingsForm from "./StorefrontSettingsForm"
import { Store } from "lucide-react"

export default async function StorefrontPage() {
    const settings = await getShopSettings()

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                    <Store size={14} />
                    Storefront
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    Shop Settings
                </h1>
                <p className="text-slate-500 text-sm">
                    Control your hero image, headline, CTA button and announcement banner.
                </p>
            </div>

            {settings ? (
                <StorefrontSettingsForm initialData={settings} />
            ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                    <Store className="mx-auto h-10 w-10 text-slate-300 mb-4" />
                    <p className="font-bold text-slate-500">Could not load settings.</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Make sure your NestJS backend has a <code className="bg-slate-100 px-1 rounded text-xs">shop-settings</code> record.
                    </p>
                </div>
            )}
        </div>
    )
}