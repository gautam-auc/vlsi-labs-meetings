"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";
import { isUserAdmin } from "../../lib/admin";

export default function RegisterPage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || email.split("@")[0];

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: fullName, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                setIsLoading(false);
                return;
            }

            if (data.token) localStorage.setItem("vlsilabs_token", data.token);
            if (data.user?.email) localStorage.setItem("vlsilabs_user_email", data.user.email);
            if (data.user?.name) localStorage.setItem("vlsilabs_user_name", data.user.name);
            const userRole = isUserAdmin(data.user?.email, data.user?.role) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_role", userRole);

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } catch {
            // Local fallback simulation
            const normalizedEmail = email.toLowerCase().trim();
            const fallbackRole = isUserAdmin(normalizedEmail) ? "admin" : "user";
            localStorage.setItem("vlsilabs_user_email", normalizedEmail);
            localStorage.setItem("vlsilabs_user_name", fullName);
            localStorage.setItem("vlsilabs_user_role", fallbackRole);

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main
            className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-cover bg-center bg-no-repeat selection:bg-[#eb6d6d] selection:text-white"
            style={{ backgroundImage: `url('/images/auth-bg.jpg')` }}
        >
            {/* Ambient Darkened Overlay for readable contrast */}
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
                        href="/login"
                        className="rounded-full border border-white/30 bg-black/30 px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                        Already have an account? Log In
                    </Link>
                </div>
            </header>

            {/* ─── MAIN CONTENT: EXACT REFERENCE SPLIT LAYOUT (CARD ON LEFT, TEXT ON RIGHT) ─── */}
            <div className="relative z-10 mx-auto flex flex-1 w-full max-w-7xl items-center justify-between px-6 py-2 sm:px-10 sm:py-2.5 my-auto">
                <div className="grid w-full items-center gap-8 lg:gap-10 lg:grid-cols-12">

                    {/* ═══ LEFT PANEL: Crisp White / Dark Card with Underline Inputs & Coral Button ═══ */}
                    <div className="flex justify-center lg:justify-start lg:col-span-6 xl:col-span-6 order-2 lg:order-1">
                        <div className="w-full max-w-md lg:max-w-lg rounded-[24px] sm:rounded-[30px] bg-white dark:bg-[#111827] p-5 sm:p-6 lg:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100/50 dark:border-slate-800 transition-colors duration-200">

                            {success ? (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-2xl mb-2.5 border border-emerald-500/30">
                                        ✓
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Account Created!</h2>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Taking you directly to your workspace...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Heading: "Sign Up" */}
                                    <div className="mb-3 sm:mb-3.5">
                                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">
                                            Sign Up
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            Create your VLSI Labs engineering profile
                                        </p>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-2 text-xs font-semibold text-red-600 dark:text-red-300">
                                            ⚠ {error}
                                        </div>
                                    )}

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                                        {/* Row 1: First Name & Last Name (2 columns) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* First Name */}
                                            <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                                <label htmlFor="reg-first-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                                    First Name
                                                </label>
                                                <input
                                                    id="reg-first-name"
                                                    type="text"
                                                    required
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="First Name"
                                                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none py-1"
                                                />
                                            </div>

                                            {/* Last Name */}
                                            <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                                <label htmlFor="reg-last-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                                    Last Name
                                                </label>
                                                <input
                                                    id="reg-last-name"
                                                    type="text"
                                                    required
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    placeholder="Last Name"
                                                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none py-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Email */}
                                        <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                                Email
                                            </label>
                                            <input
                                                id="reg-email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email"
                                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none py-1"
                                            />
                                        </div>

                                        {/* Row 3: Password */}
                                        <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                            <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                                Password
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    id="reg-password"
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
                                                    aria-label="Toggle password"
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

                                        {/* Row 4: Confirm Password */}
                                        <div className="relative border-b-2 border-slate-300 dark:border-slate-700 focus-within:border-[#eb6d6d] dark:focus-within:border-[#eb6d6d] transition-colors pb-0.5">
                                            <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                                                Confirm Password
                                            </label>
                                            <input
                                                id="reg-confirm-password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm Password"
                                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none py-1 tracking-wider"
                                            />
                                        </div>

                                        {/* Coral / Salmon Red Pill CTA Button */}
                                        <div className="pt-1">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full rounded-full bg-[#eb6d6d] hover:bg-[#e05858] active:scale-[0.99] text-white py-2.5 sm:py-3 px-6 text-sm font-bold tracking-widest shadow-lg shadow-[#eb6d6d]/35 hover:shadow-[#eb6d6d]/45 transition-all duration-200 uppercase disabled:opacity-70 cursor-pointer"
                                            >
                                                {isLoading ? "CREATING ACCOUNT..." : "Sign Up"}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Reference Footer */}
                                    <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                                        <span>Already have an account? </span>
                                        <Link
                                            href="/login"
                                            className="font-bold text-[#eb6d6d] hover:underline hover:text-[#d94d4d] cursor-pointer ml-1 uppercase tracking-wide"
                                        >
                                            LOGIN
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ═══ RIGHT PANEL: "Have an account?" + outline "LOGIN" button ═══ */}
                    <div className="flex flex-col items-center text-center lg:items-end lg:text-right lg:col-span-6 xl:col-span-6 order-1 lg:order-2 lg:pl-8">
                        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                            Have an account?
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-md drop-shadow">
                            Log back into your VLSI Labs workspace to instantly access active sessions, scheduled syncs, and recordings.
                        </p>

                        <div className="mt-5">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border-2 border-white/90 bg-white/5 hover:bg-white/20 px-9 py-2 sm:px-10 sm:py-2.5 text-xs sm:text-sm font-bold tracking-widest text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] uppercase"
                            >
                                LOGIN
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* ─── BOTTOM BAR ─── */}
            <footer className="relative z-20 flex items-center justify-between px-6 py-2 text-[11px] text-white/70 sm:px-10 shrink-0">
                <p>© {new Date().getFullYear()} VLSI Labs. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline">Enterprise Silicon CAD & Teleconference Platform</span>
                </div>
            </footer>
        </main>
    );
}
