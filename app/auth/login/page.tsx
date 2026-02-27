// app/(auth)/login/page.tsx
import { redirect } from "next/navigation"
import { auth, signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { AlertCircle } from "lucide-react"

// ------------------------------------------------------------------
// Server Action — runs on the server, no client state needed
// ------------------------------------------------------------------

async function loginAction(formData: FormData) {
    "use server"

    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/admin/dashboard",
        })
    } catch (error) {
        // Auth.js throws a NEXT_REDIRECT for successful logins
        // Re-throw it so Next.js handles the redirect
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    redirect("/login?error=invalid_credentials")
                default:
                    redirect("/login?error=server_error")
            }
        }
        throw error // re-throw redirect
    }
}

// ------------------------------------------------------------------
// Page — RSC, reads error from URL search params
// ------------------------------------------------------------------

interface Props {
    searchParams: { error?: string }
}

const ERROR_MESSAGES: Record<string, string> = {
    invalid_credentials: "Invalid email or password.",
    server_error: "Something went wrong. Please try again.",
    OAuthAccountNotLinked: "This email is already linked to another provider.",
}

export default async function LoginPage({ searchParams }: Props) {
    // Redirect already-logged-in admins away from login page
    const session = await auth()
    if (session?.user?.role === "admin") {
        redirect("/admin/dashboard")
    }

    const errorMessage = searchParams.error
        ? ERROR_MESSAGES[searchParams.error] ?? "An error occurred."
        : null

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm space-y-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                    <p className="mt-1 text-sm text-slate-500">Sign in to your admin dashboard</p>
                </div>

                {/* Error */}
                {errorMessage && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {errorMessage}
                    </div>
                )}

                {/* Credentials form */}
                <form action={loginAction} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="admin@example.com"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                        Sign in
                    </button>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-slate-50 px-2 text-slate-400">or continue with</span>
                    </div>
                </div>

                {/* Google OAuth */}
                <form
                    action={async () => {
                        "use server"
                        await signIn("google", { redirectTo: "/admin/dashboard" })
                    }}
                >
                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

            </div>
        </div>
    )
}