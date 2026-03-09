import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-slate-200">404</h1>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h2>
                <p className="mt-2 text-sm text-slate-500">
                    The page you are looking for does not exist.
                </p>
                <Link
                    href="/admin"
                    className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}