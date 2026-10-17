"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: string;
}

const baseMenuItems: MenuItem[] = [
    {
        label: "Dashboard",
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        href: "/dashboard",
    },
    {
        label: "Meetings",
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        href: "/dashboard/meetings",
    },
    {
        label: "Recordings",
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        href: "/dashboard/recordings",
    },
];

const adminMenuItem: MenuItem = {
    label: "Admin & DaaS",
    icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    href: "/dashboard/admin",
    badge: "Admin",
};

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState("A. Gautam");
    const [userRole, setUserRole] = useState("User");
    const pathname = usePathname();

    useEffect(() => {
        const email = (localStorage.getItem("vlsilabs_user_email") || "").toLowerCase().trim();
        const role = localStorage.getItem("vlsilabs_user_role") || "";
        const name = localStorage.getItem("vlsilabs_user_name") || "A. Gautam";
        setUserName(name);

        const adminEmails = ["agautamauc@gmail.com", "agautamrpr@gmail.com"];
        const adminCheck = adminEmails.includes(email) || role === "admin";
        setIsAdmin(adminCheck);
        setUserRole(adminCheck ? "Administrator" : "Member");
    }, []);

    const menuItems = isAdmin ? [...baseMenuItems, adminMenuItem] : baseMenuItems;

    return (
        <>
            {/* Mobile menu button */}
            <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm lg:hidden"
                aria-label="Toggle navigation"
            >
                {mobileOpen ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    aria-hidden="true"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                {/* Logo Header with Official Company Logo */}
                <div className="flex h-20 items-center border-b border-slate-100 dark:border-slate-800/80 px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="VLSI Labs"
                            className="h-10 w-auto object-contain"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
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
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                                            isActive
                                                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>

                                    <span className="flex-1 truncate">{item.label}</span>

                                    {"badge" in item && (
                                        <span className="rounded-md bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom section */}
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800/80 p-4">
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            pathname === "/dashboard/settings"
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </span>
                        Settings
                    </Link>

                    {/* User Profile Tile */}
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-bold text-blue-700 dark:text-blue-300">
                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {userName}
                            </p>

                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {userRole}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
