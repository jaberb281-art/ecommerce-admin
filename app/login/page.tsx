'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const { data } = await apiClient.post('/auth/login', { email, password });

            // Store the token from your NestJS response
            localStorage.setItem('token', data.accessToken);

            // Navigate to the dashboard home
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                <h1 className="text-3xl font-bold mb-2 text-center text-slate-900">Tesla Admin</h1>
                <p className="text-center text-slate-500 mb-8">Sign in to manage your store</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-slate-700">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="admin@tesla.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-slate-700">Password</label>
                        <input
                            type="password"
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </div>
    );
}