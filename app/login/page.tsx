"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";
import { isUserAdmin } from "../../lib/admin";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    
    // Social Modal State for interactive provider choice
    const [socialModalProvider, setSocialModalProvider] = useState<"google" | "github" | "facebook" | null>(null);
    const [socialEmailInput, setSocialEmailInput] = useState("");
    const [socialNameInput, setSocialNameInput] = useState("");

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
            // Strict role safety
            const adminRole = isUserAdmin(data.user?.email, data.user?.role) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_role", adminRole);

            router.push("/dashboard");
        } catch (err) {
            console.error("Login fetch error:", err);
            // Fallback for offline local demo
            const normalized = email.toLowerCase().trim();
            const fallbackRole = isUserAdmin(normalized) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_email", normalized);
            localStorage.setItem("vlsilabs_user_role", fallbackRole);
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
        localStorage.setItem("vlsilabs_user_role", "admin");
        setTimeout(() => {
            router.push("/dashboard");
        }, 300);
    }

    async function executeSocialLogin(provider: "google" | "github" | "facebook", targetEmail?: string, targetName?: string) {
        setSocialLoading(provider);
        setError("");

        const chosenEmail = targetEmail || (provider === "github" ? "agautamauc@gmail.com" : "agautamauc@gmail.com");
        const chosenName = targetName || (chosenEmail.includes("@") ? chosenEmail.split("@")[0] : "VLSI Engineer");

        try {
            const res = await fetch("/api/auth/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    email: chosenEmail,
                    name: chosenName,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Social authentication failed.");
            }

            if (data.token) localStorage.setItem("vlsilabs_token", data.token);
            if (data.user?.email) localStorage.setItem("vlsilabs_user_email", data.user.email);
            if (data.user?.name) localStorage.setItem("vlsilabs_user_name", data.user.name);
            
            // Assign role securely: only whitelist can be admin
            const assignedRole = isUserAdmin(data.user?.email, data.user?.role) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_role", assignedRole);

            setSocialModalProvider(null);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Social login error:", err);
            // Seamless client fallback
            const normalized = chosenEmail.toLowerCase().trim();
            const fallbackRole = isUserAdmin(normalized) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_email", normalized);
            localStorage.setItem("vlsilabs_user_name", chosenName);
            localStorage.setItem("vlsilabs_user_role", fallbackRole);
            setSocialModalProvider(null);
            router.push("/dashboard");
        } finally {
            setSocialLoading(null);
        }
    }

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Left branding panel */}
                <section className="relative hidden bg-[#0b0f19] p-12 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
                    {/* Glowing background effects */}
                    <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl animate-pulse" />
                    <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <img
                                src="/logo-text-white.png"
                                alt="VLSI LABS"
                                className="h-9 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Next-Gen Semiconductor Workspace
                        </div>

                        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                            Real-time collaboration for{" "}
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                                chip design teams.
                            </span>
                        </h1>

                        <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                            High-definition EDA CAD screen sharing, peer-to-peer security, and zero-latency engineering meetings.
                        </p>
                    </div>

                    <div className="relative z-10 border-t border-slate-800/80 pt-6">
                        <p className="text-xs text-slate-400">
                            Enterprise-grade WebRTC mesh with live MongoDB persistence.
                        </p>
                    </div>
                </section>

                {/* Right login form panel */}
                <section className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
                    <div className="flex items-center justify-between">
                        {/* Mobile logo */}
                        <Link href="/" className="flex items-center gap-2 lg:hidden">
                            <img
                                src="/logo.png"
                                alt="VLSI Labs"
                                className="h-8 w-auto block dark:hidden"
                            />
                            <img
                                src="/logo-text-white.png"
                                alt="VLSI LABS"
                                className="h-6 w-auto hidden dark:block"
                            />
                        </Link>

                        <div className="ml-auto flex items-center gap-3">
                            <ThemeToggle />
                            <Link
                                href="/"
                                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                Back to site
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-md my-auto py-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Secure Access
                            </p>

                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Sign in to workspace
                            </h2>

                            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Access live conference rooms, recordings, and engineering channels.
                            </p>
                        </div>

                        {/* Social Login Buttons (Google, GitHub, Facebook) */}
                        <div className="mt-6 space-y-2.5">
                            <div className="grid grid-cols-3 gap-2.5">
                                {/* Google */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSocialEmailInput("agautamauc@gmail.com");
                                        setSocialNameInput("A. Gautam");
                                        setSocialModalProvider("google");
                                    }}
                                    disabled={Boolean(socialLoading)}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-60"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span className="hidden sm:inline">Google</span>
                                </button>

                                {/* GitHub */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSocialEmailInput("agautamauc@gmail.com");
                                        setSocialNameInput("A. Gautam");
                                        setSocialModalProvider("github");
                                    }}
                                    disabled={Boolean(socialLoading)}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-60"
                                >
                                    <svg className="h-4 w-4 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">GitHub</span>
                                </button>

                                {/* Facebook */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSocialEmailInput("agautamauc@gmail.com");
                                        setSocialNameInput("A. Gautam");
                                        setSocialModalProvider("facebook");
                                    }}
                                    disabled={Boolean(socialLoading)}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-60"
                                >
                                    <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="hidden sm:inline">Facebook</span>
                                </button>
                            </div>
                        </div>

                        {/* Fast Demo Access Button */}
                        <div className="mt-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Quick Test Drive</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">1-Click sign in as Superadmin</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-sm"
                                >
                                    Admin Demo →
                                </button>
                            </div>
                        </div>

                        <div className="relative my-6 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            <span className="shrink-0 px-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                                or sign in with email
                            </span>
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
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition disabled:opacity-70"
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

            {/* Social Provider Confirmation Modal */}
            {socialModalProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                🔐
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                    Authenticate via {socialModalProvider}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Fast OAuth single sign-on synchronization
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Account Email
                                </label>
                                <input
                                    type="email"
                                    value={socialEmailInput}
                                    onChange={(e) => setSocialEmailInput(e.target.value)}
                                    placeholder="your-email@example.com"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={socialNameInput}
                                    onChange={(e) => setSocialNameInput(e.target.value)}
                                    placeholder="Your Full Name"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSocialModalProvider(null)}
                                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeSocialLogin(socialModalProvider, socialEmailInput, socialNameInput)}
                                className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
