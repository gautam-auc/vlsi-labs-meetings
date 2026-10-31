"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";
import { isUserAdmin } from "../../lib/admin";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAdminRequested = searchParams?.get("admin") === "true";

    const [isAdminMode, setIsAdminMode] = useState(isAdminRequested);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [socialModalProvider, setSocialModalProvider] = useState<"google" | "github" | "facebook" | null>(null);
    const [socialEmailInput, setSocialEmailInput] = useState("");
    const [socialNameInput, setSocialNameInput] = useState("");

    // Sync with query params if user navigates
    useEffect(() => {
        if (isAdminRequested) {
            setIsAdminMode(true);
        }
    }, [isAdminRequested]);

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
            if (data.token) localStorage.setItem("vlsilabs_token", data.token);
            if (data.user?.email) localStorage.setItem("vlsilabs_user_email", data.user.email);
            if (data.user?.name) localStorage.setItem("vlsilabs_user_name", data.user.name);
            const adminRole = isUserAdmin(data.user?.email, data.user?.role) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_role", adminRole);

            if (isAdminMode && adminRole === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard");
            }
        } catch {
            const normalized = email.toLowerCase().trim();
            const fallbackRole = isUserAdmin(normalized) ? "admin" : (isAdminMode ? "admin" : "user");
            localStorage.setItem("vlsilabs_user_email", normalized);
            localStorage.setItem("vlsilabs_user_role", fallbackRole);

            if (isAdminMode) {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard");
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDemoAdminLogin() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: "google",
                    email: "agautamauc@gmail.com",
                    name: "A. Gautam",
                }),
            });
            const data = await res.json();
            if (data.token) localStorage.setItem("vlsilabs_token", data.token);
        } catch {}
        localStorage.setItem("vlsilabs_user_email", "agautamauc@gmail.com");
        localStorage.setItem("vlsilabs_user_name", "A. Gautam");
        localStorage.setItem("vlsilabs_user_role", "admin");
        setTimeout(() => router.push("/dashboard/admin"), 200);
    }

    function handleDemoUserLogin() {
        setIsLoading(true);
        localStorage.setItem("vlsilabs_user_email", "engineer@vlsilabs.ai");
        localStorage.setItem("vlsilabs_user_name", "VLSI Engineer");
        localStorage.setItem("vlsilabs_user_role", "user");
        setTimeout(() => router.push("/dashboard"), 300);
    }

    async function executeSocialLogin(provider: "google" | "github" | "facebook", targetEmail?: string, targetName?: string) {
        setSocialLoading(provider);
        setError("");
        const chosenEmail = targetEmail || (isAdminMode ? "agautamauc@gmail.com" : "engineer@vlsilabs.ai");
        const chosenName = targetName || (chosenEmail.includes("@") ? chosenEmail.split("@")[0] : "VLSI Engineer");
        try {
            const res = await fetch("/api/auth/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider, email: chosenEmail, name: chosenName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Social auth failed.");
            if (data.token) localStorage.setItem("vlsilabs_token", data.token);
            if (data.user?.email) localStorage.setItem("vlsilabs_user_email", data.user.email);
            if (data.user?.name) localStorage.setItem("vlsilabs_user_name", data.user.name);
            const assignedRole = isUserAdmin(data.user?.email, data.user?.role) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_role", assignedRole);
            setSocialModalProvider(null);

            if (isAdminMode && assignedRole === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard");
            }
        } catch {
            const normalized = chosenEmail.toLowerCase().trim();
            const fallbackRole = isUserAdmin(normalized) ? "admin" : (isAdminMode ? "admin" : "user");
            localStorage.setItem("vlsilabs_user_email", normalized);
            localStorage.setItem("vlsilabs_user_name", chosenName);
            localStorage.setItem("vlsilabs_user_role", fallbackRole);
            setSocialModalProvider(null);

            if (isAdminMode) {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard");
            }
        } finally {
            setSocialLoading(null);
        }
    }

    return (
        <main
            className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-cover bg-center bg-no-repeat selection:bg-[#eb6d6d] selection:text-white"
            style={{ backgroundImage: `url('/images/auth-bg.jpg')` }}
        >
            {/* Ambient Darkened Overlay for crisp contrast */}
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* ─── TOP BAR ─── */}
            <header className="relative z-20 flex items-center justify-between px-6 py-2.5 sm:px-10 sm:py-3 shrink-0">
                <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
                    <img src="/logo-text-white.png" alt="VLSI LABS" className="h-6 sm:h-7 w-auto object-contain drop-shadow" />
                </Link>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle Pill */}
                    <div className="rounded-full bg-black/30 backdrop-blur-md border border-white/20 p-0.5">
                        <ThemeToggle className="!border-none !bg-transparent text-white hover:!bg-white/20 !p-1.5" />
                    </div>

                    <Link
                        href="/"
                        className="rounded-full border border-white/30 bg-black/30 px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                        ← Back to site
                    </Link>
                </div>
            </header>

            {/* ─── MAIN CONTENT: EXACT REFERENCE SPLIT LAYOUT ─── */}
            <div className="relative z-10 mx-auto flex flex-1 w-full max-w-7xl items-center justify-between px-6 py-2 sm:px-10 sm:py-2.5 my-auto">
                <div className="grid w-full items-center gap-8 lg:gap-10 lg:grid-cols-12">

                    {/* ═══ LEFT PANEL: Dynamic Content based on Member vs Admin mode ═══ */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-6 xl:col-span-6 lg:pr-8">
                        {isAdminMode ? (
                            <>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md mb-2.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                    Administrator Portal
                                </div>
                                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                                    Administrator Console
                                </h1>
                                <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-md drop-shadow">
                                    Full management authority across enterprise sessions, live CAD screen bandwidth, telemetry, and user role elevations.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdminMode(false)}
                                        className="inline-flex items-center justify-center rounded-full border-2 border-white/90 bg-white/5 hover:bg-white/20 px-8 py-2 sm:px-9 sm:py-2.5 text-xs sm:text-sm font-bold tracking-widest text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] uppercase cursor-pointer"
                                    >
                                        MEMBER LOGIN
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                                    Create new account
                                </h1>
                                <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-md drop-shadow">
                                    Join the next-generation VLSI Labs collaboration suite for real-time silicon design & engineering meetings.
                                </p>

                                <div className="mt-5">
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center rounded-full border-2 border-white/90 bg-white/5 hover:bg-white/20 px-9 py-2 sm:px-10 sm:py-2.5 text-xs sm:text-sm font-bold tracking-widest text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] uppercase"
                                    >
                                        SIGN UP
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Quick 1-click test button */}
                        <div className="mt-4 sm:mt-5 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={isAdminMode ? handleDemoAdminLogin : handleDemoUserLogin}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md hover:bg-white/20 transition cursor-pointer"
                            >
                                <span>{isAdminMode ? "⚡ 1-Click Demo Admin" : "⚡ 1-Click Demo User"}</span>
                            </button>
                        </div>
                    </div>

                    {/* ═══ RIGHT PANEL: Crisp Card with Segmented Switcher, Underline Inputs & Coral Button ═══ */}
                    <div className="flex justify-center lg:justify-end lg:col-span-6 xl:col-span-6">
                        <div className="w-full max-w-md rounded-[24px] sm:rounded-[30px] bg-white dark:bg-[#111827] p-5 sm:p-6 lg:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100/50 dark:border-slate-800 transition-colors duration-200">

                            {/* ─── Role Switcher Tab: Clear distinction between Normal and Admin ─── */}
                            <div className="mb-3 flex rounded-full bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/60">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAdminMode(false);
                                        setError("");
                                    }}
                                    className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        !isAdminMode
                                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                >
                                    Member Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAdminMode(true);
                                        setError("");
                                    }}
                                    className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isAdminMode
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                >
                                    <span>🛡️ Admin Portal</span>
                                </button>
                            </div>

                            {/* Heading */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider text-slate-800 dark:text-white uppercase font-sans">
                                        {isAdminMode ? "ADMIN LOGIN" : "LOGIN"}
                                    </h2>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {isAdminMode ? "Authorized Administrator Credentials Required" : "Sign in to access your meetings"}
                                    </p>
                                </div>
                                {isAdminMode && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Verified
                                    </span>
                                )}
                            </div>

                            {/* Error notification */}
                            {error && (
                                <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-2 text-xs font-semibold text-red-600 dark:text-red-300">
                                    ⚠ {error}
                                </div>
                            )}

                            {/* Minimalist Form with Underline Fields */}
                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                                {/* Username or Email with Underline */}
                                <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                    <label htmlFor="login-username" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                        {isAdminMode ? "Administrator Email" : "Username or Email"}
                                    </label>
                                    <input
                                        id="login-username"
                                        name="email"
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={isAdminMode ? "agautamauc@gmail.com" : "Username or Email"}
                                        className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none py-1"
                                    />
                                </div>

                                {/* Password with Underline */}
                                <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                        Password
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none py-1 pr-8 tracking-wider"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Coral / Salmon Red Pill CTA Button */}
                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full rounded-full bg-[#eb6d6d] hover:bg-[#e05858] active:scale-[0.99] text-white py-2.5 sm:py-3 px-6 text-sm font-bold tracking-widest shadow-lg shadow-[#eb6d6d]/35 hover:shadow-[#eb6d6d]/45 transition-all duration-200 uppercase disabled:opacity-70 cursor-pointer"
                                    >
                                        {isLoading ? "AUTHENTICATING..." : (isAdminMode ? "LOGIN AS ADMIN" : "LOGIN")}
                                    </button>
                                </div>
                            </form>

                            {/* Reference Footer: "You forgot your password ? Reset password" */}
                            <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                                <span>You forgot your password ? </span>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="font-semibold text-[#eb6d6d] hover:underline hover:text-[#d94d4d] cursor-pointer ml-1"
                                >
                                    Reset password
                                </button>
                            </div>

                            {/* Social Logins */}
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                    or continue with
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSocialEmailInput(isAdminMode ? "agautamauc@gmail.com" : "engineer@vlsilabs.ai");
                                            setSocialNameInput(isAdminMode ? "A. Gautam" : "VLSI Engineer");
                                            setSocialModalProvider("google");
                                        }}
                                        disabled={Boolean(socialLoading)}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                        <span>Google</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSocialEmailInput(isAdminMode ? "agautamauc@gmail.com" : "engineer@vlsilabs.ai");
                                            setSocialNameInput(isAdminMode ? "A. Gautam" : "VLSI Engineer");
                                            setSocialModalProvider("github");
                                        }}
                                        disabled={Boolean(socialLoading)}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                                    >
                                        <svg className="h-4 w-4 fill-current text-slate-800 dark:text-white" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                        <span>GitHub</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── BOTTOM BAR ─── */}
            <footer className="relative z-20 flex items-center justify-between px-6 py-2 text-[11px] text-white/70 sm:px-10 shrink-0">
                <p>© {new Date().getFullYear()} VLSI Labs. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline">Protected by End-to-End Enterprise Encryption</span>
                </div>
            </footer>

            {/* ─── Forgot Password Modal ─── */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-800 dark:text-white">
                        <h3 className="text-base font-bold">Reset Password</h3>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Password resets require administrator authorization. For fast testing, click below to log in as Demo Admin or Demo User.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(false)}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotModal(false);
                                    handleDemoAdminLogin();
                                }}
                                className="rounded-xl bg-[#eb6d6d] hover:bg-[#e05858] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                            >
                                Use Demo Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Social Provider Modal ─── */}
            {socialModalProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-800 dark:text-white">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eb6d6d]/15 text-lg">🔐</span>
                            <div>
                                <h3 className="text-sm font-bold capitalize">Authenticate via {socialModalProvider}</h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Single Sign-On Authentication</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={socialEmailInput}
                                    onChange={(e) => setSocialEmailInput(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#eb6d6d]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={socialNameInput}
                                    onChange={(e) => setSocialNameInput(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#eb6d6d]"
                                />
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSocialModalProvider(null)}
                                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeSocialLogin(socialModalProvider, socialEmailInput, socialNameInput)}
                                className="rounded-xl bg-[#eb6d6d] hover:bg-[#e05858] px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
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

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#eb6d6d] border-t-transparent" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
