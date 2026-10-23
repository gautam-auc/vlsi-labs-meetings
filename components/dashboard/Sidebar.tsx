"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isUserAdmin } from "../../lib/admin";
import ThemeToggle from "../ThemeToggle";

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
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        href: "/dashboard",
    },
    {
        label: "Meetings",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        href: "/dashboard/meetings",
    },
    {
        label: "Recordings",
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        href: "/dashboard/recordings",
    },
];

const adminMenuItem: MenuItem = {
    label: "Admin & DaaS",
    icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    href: "/dashboard/admin",
    badge: "Admin",
};

export default function Sidebar() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState("A. Gautam");
    const [userRole, setUserRole] = useState("User");
    const pathname = usePathname();

    useEffect(() => {
        const email = (localStorage.getItem("vlsilabs_user_email") || "").toLowerCase().trim();
        const role = localStorage.getItem("vlsilabs_user_role") || "";
        const name = localStorage.getItem("vlsilabs_user_name") || "A. Gautam";
        setUserName(name);

        const adminCheck = isUserAdmin(email, role);
        setIsAdmin(adminCheck);
        setUserRole(adminCheck ? "Administrator" : "Member");
    }, []);

    const menuItems = isAdmin ? [...baseMenuItems, adminMenuItem] : baseMenuItems;

    return (
        <>
            {/* Desktop Floating Curved Purple Navigation Rail (Behance Meeting Scheduler Style) */}
            <aside className="fixed left-4 top-4 bottom-4 z-40 hidden lg:flex w-20 flex-col items-center justify-between rounded-[2.2rem] bg-[#6d28d9] dark:bg-[#5b21b6] py-6 shadow-2xl shadow-purple-900/30 transition-all duration-300">
                {/* Top Logo / Brand Emblem */}
                <div className="flex flex-col items-center">
                    <Link
                        href="/"
                        title="VLSI Labs Home"
                        className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-all duration-200 active:scale-95"
                    >
                        <img
                            src="/logo.png"
                            alt="VLSI Labs"
                            className="h-8 w-8 object-contain drop-shadow"
                        />
                    </Link>
                </div>

                {/* Vertical Squircle Icon Navigation */}
                <nav className="flex flex-col items-center gap-3.5 my-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <div key={item.label} className="relative group">
                                <Link
                                    href={item.href}
                                    title={item.label}
                                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
                                        isActive
                                            ? "bg-white text-[#6d28d9] shadow-lg shadow-purple-950/20 scale-105"
                                            : "text-purple-200 hover:bg-white/15 hover:text-white"
                                    }`}
                                >
                                    {item.icon}

                                    {/* Indicator Dot for Admin / Updates */}
                                    {"badge" in item && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500" />
                                        </span>
                                    )}
                                </Link>

                                {/* Floating Tooltip */}
                                <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900/95 dark:bg-white/95 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-xl opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1 z-50">
                                    {item.label}
                                </div>
                            </div>
                        );
                    })}

                    {/* Quick Notifications / Bell */}
                    <div className="relative group">
                        <button
                            type="button"
                            title="Notifications"
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-purple-200 hover:bg-white/15 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900/95 dark:bg-white/95 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-xl opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1 z-50">
                            Activity
                        </div>
                    </div>
                </nav>

                {/* Bottom Actions: Settings & Theme & Avatar */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                        <Link
                            href="/dashboard/settings"
                            title="Workspace Settings"
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                                pathname === "/dashboard/settings"
                                    ? "bg-white text-[#6d28d9] shadow-lg"
                                    : "text-purple-200 hover:bg-white/15 hover:text-white"
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                        <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900/95 dark:bg-white/95 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-xl opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1 z-50">
                            Settings
                        </div>
                    </div>

                    {/* Theme Toggle Button */}
                    <div className="rounded-2xl bg-white/10 p-1 hover:bg-white/20 transition">
                        <ThemeToggle />
                    </div>

                    {/* User Avatar */}
                    <div className="relative group mt-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-indigo-300 text-sm font-bold text-slate-900 shadow-md">
                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="pointer-events-none absolute left-full bottom-0 ml-3 whitespace-nowrap rounded-xl bg-slate-900/95 dark:bg-white/95 px-3 py-2 text-xs font-semibold text-white dark:text-slate-900 shadow-xl opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1 z-50">
                            <p className="font-bold">{userName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{userRole}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Floating Curved Navigation Bar */}
            <div className="fixed bottom-4 inset-x-4 z-40 lg:hidden flex items-center justify-around rounded-[1.8rem] bg-[#6d28d9] dark:bg-[#5b21b6] p-2 text-white shadow-2xl shadow-purple-950/40 border border-white/15 backdrop-blur-xl">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            title={item.label}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                isActive ? "bg-white text-[#6d28d9] shadow-md font-bold" : "text-purple-200"
                            }`}
                        >
                            {item.icon}
                        </Link>
                    );
                })}

                <Link
                    href="/dashboard/settings"
                    title="Settings"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        pathname === "/dashboard/settings" ? "bg-white text-[#6d28d9] shadow-md" : "text-purple-200"
                    }`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </Link>

                {/* Mobile Admin/Login Portal Button for small screen clarity */}
                <Link
                    href="/login?admin=true"
                    title="Admin & Login Portal"
                    className="flex h-10 px-2.5 items-center gap-1.5 justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition active:scale-95"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Admin/Login</span>
                </Link>

                <div className="scale-90">
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
}
