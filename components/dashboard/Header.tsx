"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Link from "next/link";
import ThemeToggle from "../ThemeToggle";

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
}

export default function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
    const [userName, setUserName] = useState("A. Gautam");
    const [userRole, setUserRole] = useState("Member");
    const [currentDateString, setCurrentDateString] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        const storedName = localStorage.getItem("vlsilabs_user_name");
        const storedRole = localStorage.getItem("vlsilabs_user_role");
        if (storedName) setUserName(storedName);
        if (storedRole === "admin") setUserRole("Admin");

        // Format: "Thursday, 22 October"
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
        setCurrentDateString(now.toLocaleDateString("en-US", options));
    }, []);

    return (
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            {/* Left: Behance Circular Moon Theme Toggle (Image 1) + Dynamic Day & Date */}
            <div className="flex items-center gap-3">
                {/* Circular Double-Ring Behance Theme Toggle matching Image 1 */}
                <ThemeToggle variant="behance" />

                {/* Date & Weather Indicator matching Behance UI */}
                <div className="flex items-center gap-2.5">
                    <span className="text-xl select-none" role="img" aria-label="weather">⛅</span>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 leading-tight">
                            Today&apos;s Schedule
                        </p>
                        <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
                            {currentDateString || "Today"}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Center / Right: Rounded Capsule Search Bar (Behance Style) */}
            <div className="flex items-center gap-3 flex-1 max-w-md mx-auto sm:mx-0">
                <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-violet-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search meetings, ID, or host..."
                        className="w-full rounded-full border border-violet-100 dark:border-white/10 bg-white/90 dark:bg-[#151724] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-sm transition"
                    />
                </div>
            </div>

            {/* Right: Live Engine Indicator & Admin/Login & User Pill */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
                {/* MongoDB Live Engine Pulse (Hidden on very small mobile) */}
                <div className="hidden xs:flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>MongoDB Live</span>
                </div>

                {/* Prominent Admin / Login Button specifically visible on small screens and desktop */}
                <Link
                    href="/login?admin=true"
                    title="Admin & Login Portal"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition active:scale-95 whitespace-nowrap"
                >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Admin/Login</span>
                </Link>

                {/* User Avatar Pill */}
                <div className="flex items-center gap-2 rounded-full border border-violet-100 dark:border-white/10 bg-white/90 dark:bg-[#151724] p-1 sm:pr-3.5 shadow-sm">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#6d28d9] to-pink-500 text-xs font-bold text-white shadow-sm">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                            {userName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-none">
                            {userRole}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}