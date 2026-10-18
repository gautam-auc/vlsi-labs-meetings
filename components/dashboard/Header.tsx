"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function Header() {
    const [userName, setUserName] = useState("A. Gautam");
    const [userRole, setUserRole] = useState("Member");
    const pathname = usePathname();

    useEffect(() => {
        const storedName = localStorage.getItem("vlsilabs_user_name");
        const storedRole = localStorage.getItem("vlsilabs_user_role");
        if (storedName) setUserName(storedName);
        if (storedRole === "admin") setUserRole("Admin");
    }, []);

    const getPageTitle = () => {
        if (pathname.includes("/admin")) return "Admin & DaaS Reports";
        if (pathname.includes("/meetings")) return "Scheduled Meetings";
        if (pathname.includes("/recordings")) return "Cloud Recordings";
        if (pathname.includes("/settings")) return "Workspace Settings";
        return "Executive Overview";
    };

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-xl px-6 lg:px-8 transition-colors duration-200 shadow-sm">
            {/* Page information */}
            <div className="pl-12 lg:pl-0">
                <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        VLSI Workspace
                    </p>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Live Cloud Engine
                    </span>
                </div>

                <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Live server indicator */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>MongoDB Live</span>
                </div>

                {/* Global Theme Toggle */}
                <ThemeToggle />

                {/* User Pill */}
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-1.5 shadow-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </span>

                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {userName}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                            {userRole}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}