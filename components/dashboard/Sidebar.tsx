"use client";

import { useState } from "react";
import Link from "next/link";

const menuItems = [
    {
        label: "Dashboard",
        icon: "⌂",
        href: "/dashboard",
    },
    {
        label: "Meetings",
        icon: "▣",
        href: "/dashboard/meetings",
    },
    {
        label: "Calendar",
        icon: "□",
        href: "#calendar",
    },
    {
        label: "Team",
        icon: "♙",
        href: "#team",
    },
    {
        label: "Notes",
        icon: "☷",
        href: "#notes",
    },
];

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
                aria-label="Toggle navigation"
            >
                {mobileOpen ? "×" : "☰"}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex h-20 items-center border-b border-slate-100 px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                            V
                        </div>

                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                VLSI Labs
                            </p>

                            <p className="text-[11px] font-medium text-slate-500">
                                Meetings
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="px-4 pt-6">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Workspace
                    </p>

                    <nav className="mt-3 space-y-1">
                        {menuItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.label === "Dashboard"
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                                    {item.icon}
                                </span>

                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Bottom section */}
                <div className="mt-auto border-t border-slate-100 p-4">
                    <a
                        href="#settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                            ⚙
                        </span>

                        Settings
                    </a>

                    {/* User */}
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            AG
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                A. Gautam
                            </p>

                            <p className="truncate text-xs text-slate-500">
                                Administrator
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
