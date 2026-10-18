"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
    const router = useRouter();

    const handleInstantMeeting = () => {
        const id = `vlsi-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 6)}`;
        router.push(`/meet/${id}`);
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-200">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    {/* Light Mode Logo */}
                    <img
                        src="/logo.png"
                        alt="VLSI Labs"
                        className="h-9 w-auto object-contain block dark:hidden"
                    />

                    {/* Dark Mode White Bold Text Logo */}
                    <img
                        src="/logo-text-white.png"
                        alt="VLSI LABS"
                        className="h-7 w-auto object-contain hidden dark:block"
                    />

                    <div className="block dark:hidden">
                        <p className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            VLSI Labs
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </span>
                        </p>

                        <p className="text-[11px] font-medium text-slate-500">
                            Enterprise Meetings
                        </p>
                    </div>

                    <div className="hidden sm:dark:flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Online
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-7 md:flex">
                    <a
                        href="#join-section"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Join Meeting
                    </a>

                    <a
                        href="#features"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Features
                    </a>

                    <a
                        href="#telemetry"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Live Telemetry
                    </a>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <ThemeToggle />

                    {/* Instant Meeting Action */}
                    <button
                        type="button"
                        onClick={handleInstantMeeting}
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    >
                        <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Meeting</span>
                    </button>

                    {/* Prominent Admin Login Button */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Admin Login</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
