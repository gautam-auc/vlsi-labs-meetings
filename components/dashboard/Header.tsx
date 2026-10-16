"use client";

import Link from "next/link";
import { useUserSession } from "../../lib/session";
import ThemeToggle from "../theme/ThemeToggle";

export default function Header() {
    const user = useUserSession();

    const initials = user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AG";

    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
            {/* Page information */}
            <div className="pl-12 lg:pl-0">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
                    Workspace
                </p>

                <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                    Dashboard
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2.5">
                {/* Global Theme Toggle */}
                <ThemeToggle />

                <Link
                    href="/dashboard/admin"
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/40 flex items-center gap-1.5"
                >
                    <span>🛡️</span>
                    <span>Admin Panel</span>
                </Link>

                <Link
                    href="/"
                    className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:inline-flex"
                >
                    Home
                </Link>

                {/* User badge */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {initials}
                    </span>

                    <div className="hidden flex-col sm:flex">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-none">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}