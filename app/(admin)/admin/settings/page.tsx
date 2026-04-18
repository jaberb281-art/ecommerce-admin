"use client"

import { useState, useTransition } from "react"
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, Info } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────
type VerifyStatus = "idle" | "loading" | "ok" | "error"

// ─── Shared input classes ─────────────────────────────────────────────────
const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-mono"

// ─── Section wrapper ──────────────────────────────────────────────────────
function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType
    title: string
    children: React.ReactNode
}) {
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

function Field({
    label,
    hint,
    children,
}: {
    label: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </label>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {children}
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────
export default function EmailSettingsPage() {
    const [mailFrom, setMailFrom] = useState(process.env.NEXT_PUBLIC_MAIL_FROM || "")
    const [testEmail, setTestEmail] = useState("")
    const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle")
    const [verifyMessage, setVerifyMessage] = useState("")
    const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")
    const [isPending, startTransition] = useTransition()

    async function handleVerify() {
        if (!testEmail) return
        setVerifyStatus("loading")
        setVerifyMessage("")
        try {
            const res = await fetch("/api/proxy/mail/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: testEmail }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                setVerifyStatus("ok")
                setVerifyMessage(data.message || "Test email sent successfully.")
            } else {
                setVerifyStatus("error")
                setVerifyMessage(data.message || "Failed to send test email. Check your RESEND_API_KEY.")
            }
        } catch {
            setVerifyStatus("error")
            setVerifyMessage("Could not reach the backend. Is it running?")
        }
    }

    function handleSave() {
        startTransition(async () => {
            setSaveStatus("idle")
            try {
                const res = await fetch("/api/proxy/admin/settings/mail", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mailFrom }),
                })
                if (res.ok) {
                    setSaveStatus("saved")
                    setTimeout(() => setSaveStatus("idle"), 2500)
                } else {
                    setSaveStatus("error")
                    setTimeout(() => setSaveStatus("idle"), 3000)
                }
            } catch {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                    <Mail size={14} />
                    Email Integration
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    Email Settings
                </h1>
                <p className="text-slate-500 text-sm">
                    Configure the Resend integration used for password resets and notifications.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <Info size={14} className="text-slate-400 shrink-0" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Required environment variables
                    </p>
                </div>
                <div className="space-y-2">
                    {[
                        { key: "RESEND_API_KEY", desc: "Your Resend secret key — starts with re_" },
                        { key: "MAIL_FROM", desc: 'Sender address e.g. Shbash <noreply@shbash.co>' },
                    ].map(({ key, desc }) => (
                        <div key={key} className="flex items-start gap-3">
                            <code className="text-xs font-mono bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700">
                                {key}
                            </code>
                            <span className="text-xs text-slate-400">{desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Section icon={Globe} title="Sender Address (MAIL_FROM)">
                <Field label="From address" hint='Format: "Name <address@domain.com>"'>
                    <input
                        type="text"
                        value={mailFrom}
                        onChange={e => setMailFrom(e.target.value)}
                        placeholder='Shbash <noreply@shbash.co>'
                        className={inputCls}
                    />
                </Field>
                <div className="flex items-center justify-end gap-3 pt-1">
                    {saveStatus === "saved" && <span className="text-emerald-600 text-sm font-semibold">Saved!</span>}
                    <button
                        onClick={handleSave}
                        disabled={isPending || !mailFrom}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm"
                    >
                        {isPending ? "Saving..." : "Save Address"}
                    </button>
                </div>
            </Section>

            <Section icon={Send} title="Verify Integration">
                <Field label="Send test to">
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            placeholder="your@email.com"
                            className={inputCls}
                        />
                        <button
                            onClick={handleVerify}
                            disabled={verifyStatus === "loading" || !testEmail}
                            className="bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold text-sm"
                        >
                            {verifyStatus === "loading" ? "Sending..." : "Send Test"}
                        </button>
                    </div>
                </Field>
                {verifyStatus !== "idle" && (
                    <div className={`mt-4 p-3 rounded-lg border text-xs ${verifyStatus === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {verifyMessage}
                    </div>
                )}
            </Section>
        </div>
    )
}