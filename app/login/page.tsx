"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GoogleAuthModal from "../../components/auth/GoogleAuthModal";
import { saveUserSession } from "../../lib/session";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [googleModalOpen, setGoogleModalOpen] = useState(false);

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Please enter your work email.");
            return;
        }

        setLoading(true);

        const displayName = email.includes("@")
            ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : "Team Member";

        const user = {
            name: displayName,
            email: email.trim(),
            role: email.toLowerCase().includes("admin") ? "Administrator" : "Member",
            isGuest: false,
            provider: "email" as const,
        };

        saveUserSession(user);

        setTimeout(() => {
            router.push("/dashboard");
        }, 300);
    };

    const handleGuestLogin = () => {
        setLoading(true);
        const guestUser = {
            name: "Guest User",
            email: "guest@vlsilabs.ai",
            role: "Guest",
            isGuest: true,
            provider: "guest" as const,
        };

        saveUserSession(guestUser);
        router.push("/dashboard");
    };

    const handleDemoFill = () => {
        setEmail("agautam@vlsilabs.ai");
        setPassword("••••••••••••");
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <GoogleAuthModal
                isOpen={googleModalOpen}
                onClose={() => setGoogleModalOpen(false)}
            />

            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Left branding panel */}
                <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="VLSI Labs"
                                width={40}
                                height={40}
                                className="h-10 w-10 object-contain rounded-full"
                                referrerPolicy="no-referrer"
                            />

                            <div>
                                <p className="font-bold">VLSI Labs</p>
                                <p className="text-xs text-slate-400">Meetings</p>
                            </div>
                        </Link>
                    </div>

                    <div className="max-w-lg">
                        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                            VLSI Labs Meetings
                        </p>

                        <h1 className="mt-5 text-5xl font-bold leading-tight">
                            Bring your team together.
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-400">
                            Schedule meetings, collaborate with your team and keep your
                            work moving from one focused workspace.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Internal collaboration platform</span>
                        <span>·</span>
                        <Link href="/dashboard/admin" className="text-indigo-400 hover:underline">
                            Admin Control Plane →
                        </Link>
                    </div>
                </section>

                {/* Login panel */}
                <section className="flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="mb-8 lg:hidden">
                            <Link href="/" className="flex items-center gap-3">
                                <Image
                                    src="/logo.png"
                                    alt="VLSI Labs"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-contain rounded-full"
                                    referrerPolicy="no-referrer"
                                />

                                <div>
                                    <p className="font-bold text-slate-900">
                                        VLSI Labs
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Meetings
                                    </p>
                                </div>
                            </Link>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-indigo-600">
                                Welcome back
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                Sign in to your workspace
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                One-click Google sign in or explore directly as a guest.
                            </p>
                        </div>

                        {/* Direct Google Sign In Button (Like Google Meet) */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setGoogleModalOpen(true)}
                                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 focus:ring-4 focus:ring-indigo-500/10"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-50 px-3 text-slate-400">
                                    or sign in with email
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Work email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@vlsilabs.ai"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleDemoFill}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Fill demo credentials
                                    </button>
                                </div>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {loading ? "Signing in..." : "Sign in to Dashboard"}
                            </button>
                        </form>

                        {/* Guest Quick Access Banner */}
                        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                                        Instant Guest Mode
                                    </p>
                                    <p className="mt-0.5 text-xs text-indigo-600/90">
                                        Test rooms and meetings immediately.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGuestLogin}
                                    className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Guest Access →
                                </button>
                            </div>
                        </div>

                        {/* Register */}
                        <p className="mt-6 text-center text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                Create account
                            </Link>
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-4 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
                            <Link
                                href="/"
                                className="hover:text-slate-900 transition"
                            >
                                ← Home
                            </Link>
                            <span>·</span>
                            <Link
                                href="/dashboard/admin"
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                Admin Database & Storage
                            </Link>
                        </div>

                    </div>
                </section>
            </div>
        </main>
    );
}
