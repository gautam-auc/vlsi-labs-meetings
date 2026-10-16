"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserSession } from "../../lib/session";
import {
    LayoutDashboard,
    Calendar,
    Video,
    Shield,
    Users,
    Settings,
    X,
    Menu,
} from "lucide-react";

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const user = useUserSession();

    const initials =
        user.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "AG";

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            label: "Meetings",
            icon: Calendar,
            href: "/dashboard/meetings",
        },
        {
            label: "Recordings",
            icon: Video,
            href: "/dashboard/recordings",
        },
        {
            label: "Admin & Console",
            icon: Shield,
            href: "/dashboard/admin",
        },
        {
            label: "Team Directory",
            icon: Users,
            href: "/dashboard/admin",
        },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 lg:hidden"
                aria-label="Toggle navigation"
            >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex h-20 items-center border-b border-slate-100 px-6 dark:border-slate-800">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="VLSI Labs"
                            width={36}
                            height={44}
                            className="h-9 w-auto object-contain"
                            referrerPolicy="no-referrer"
                        />

                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                VLSI Labs
                            </p>

                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Meetings
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="px-4 pt-6">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Workspace
                    </p>

                    <nav className="mt-3 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                    }`}
                                >
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                                            isActive
                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>

                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom section */}
                <div className="mt-auto border-t border-slate-100 p-4 dark:border-slate-800">
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            pathname === "/dashboard/settings"
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Settings className="h-4 w-4" />
                        </span>

                        Settings
                    </Link>

                    {/* User */}
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-200">
                                {user.name}
                            </p>

                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
