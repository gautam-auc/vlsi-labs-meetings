"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed. Please verify your credentials.");
                setIsLoading(false);
                return;
            }

            if (data.token) {
                localStorage.setItem("vlsilabs_token", data.token);
            }
            if (data.user?.email) {
                localStorage.setItem("vlsilabs_user_email", data.user.email);
            }
            if (data.user?.name) {
                localStorage.setItem("vlsilabs_user_name", data.user.name);
            }

            router.push("/dashboard");
        } catch (err) {
            console.error("Login fetch error:", err);
            // Fallback for offline local demo
            localStorage.setItem("vlsilabs_user_email", email);
            router.push("/dashboard");
        } finally {
            setIsLoading(false);
        }
    }

    function handleDemoLogin() {
        setEmail("agautamauc@gmail.com");
        setPassword("••••••••••••");
        setIsLoading(true);
        localStorage.setItem("vlsilabs_user_email", "agautamauc@gmail.com");
        localStorage.setItem("vlsilabs_user_name", "A. Gautam");
        setTimeout(() => {
            router.push("/dashboard");
        }, 300);
    }

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Left branding panel */}
                <section className="relative hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
                    {/* Glowing background effects */}
                    <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
                                V
                            </div>

                            <div>
                                <p className="font-bold text-base tracking-tight">VLSI Labs</p>
                                <p className="text-xs text-slate-400">Engineering Collaboration</p>
                            </div>
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Next-Gen Semiconductor Workspace
                        </div>

                        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                            High-frequency meetings for high-velocity teams.
                        </h1>

                        <p className="mt-6 text-base leading-7 text-slate-300">
                            Instant WebRTC video channels, interactive circuit and architecture review, screen broadcasting, and persistent meeting tracking.
                        </p>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">✓</span>
                                Zero-latency peer signaling over WebSockets
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">✓</span>
                                Enterprise-grade encryption & security standards
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">✓</span>
                                Seamless Light and Night mode workspaces
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
                        <p>© 2026 VLSI Labs Inc.</p>
                        <p>Internal Engineering Platform</p>
                    </div>
                </section>

                {/* Right login panel */}
                <section className="relative flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16">
                    {/* Header bar with Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="lg:hidden">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
                                    V
                                </div>
                                <span className="font-bold text-sm text-slate-900 dark:text-white">VLSI Labs</span>
                            </Link>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            <ThemeToggle />
                            <Link
                                href="/"
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                            >
                                Home
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-md my-auto py-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Secure Access
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Sign in to workspace
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Access your scheduled calls, team channels, and conference rooms.
                            </p>
                        </div>

                        {/* Fast Demo Access Button */}
                        <div className="mt-6 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Quick Test Drive</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">Explore the complete dashboard directly</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-sm"
                                >
                                    Demo Login →
                                </button>
                            </div>
                        </div>

                        <div className="relative my-6 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            <span className="shrink-0 px-3 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">or sign in with credentials</span>
                            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                ⚠ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Work Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@vlsilabs.ai"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        Password
                                    </label>

                                    <a
                                        href="#"
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Forgot?
                                    </a>
                                </div>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition disabled:opacity-70"
                            >
                                {isLoading ? "Authenticating..." : "Sign in to Dashboard →"}
                            </button>
                        </form>

                        {/* Register Link */}
                        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            Don&apos;t have an account yet?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Create workspace account
                            </Link>
                        </p>
                    </div>

                    <div className="pt-4 text-center">
                        <Link
                            href="/"
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
