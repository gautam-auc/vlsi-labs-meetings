"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [workspace, setWorkspace] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        if (email) {
            localStorage.setItem("vlsilabs_user_email", email);
        }
        if (name) {
            localStorage.setItem("vlsilabs_user_name", name);
        }
        if (workspace) {
            localStorage.setItem("vlsilabs_workspace", workspace);
        }
        setTimeout(() => {
            router.push("/dashboard");
        }, 400);
    }

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Left branding panel */}
                <section className="relative hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
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
                                <p className="text-xs text-slate-400">Enterprise Meetings</p>
                            </div>
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-6">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Fast Team Onboarding
                        </div>

                        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                            One unified hub for silicon design reviews.
                        </h1>

                        <p className="mt-6 text-base leading-7 text-slate-300">
                            Create your engineering workspace, invite cross-functional colleagues, and run low-latency video meetings instantly.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <p className="text-2xl font-bold text-white">100%</p>
                                <p className="mt-1 text-xs text-slate-400">WebRTC Encrypted</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <p className="text-2xl font-bold text-white">&lt;50ms</p>
                                <p className="mt-1 text-xs text-slate-400">Global Peer Latency</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
                        <p>© 2026 VLSI Labs Inc.</p>
                        <p>Hardware & Systems Collaboration</p>
                    </div>
                </section>

                {/* Right register panel */}
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

                    <div className="mx-auto w-full max-w-md my-auto py-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Get Started
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Create your workspace
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Set up your team&apos;s meetings and collaboration center in 30 seconds.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alex Gautam"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

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
                                    placeholder="name@company.com"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="workspace"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Workspace / Organization Name
                                </label>

                                <input
                                    id="workspace"
                                    name="workspace"
                                    type="text"
                                    required
                                    value={workspace}
                                    onChange={(e) => setWorkspace(e.target.value)}
                                    placeholder="e.g. VLSI Silicon Team"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a secure password"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition disabled:opacity-70 mt-2"
                            >
                                {isLoading ? "Creating Workspace..." : "Create Workspace & Continue →"}
                            </button>
                        </form>

                        {/* Sign in Link */}
                        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Sign in
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
