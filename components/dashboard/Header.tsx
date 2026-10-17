"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";

export default function Header() {
    const [userName, setUserName] = useState("A. Gautam");

    useEffect(() => {
        const storedName = localStorage.getItem("vlsilabs_user_name");
        if (storedName) setUserName(storedName);
    }, []);

    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-8 transition-colors duration-200">
            {/* Page information */}
            <div className="pl-12 lg:pl-0">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Workspace
                </p>

                <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    Dashboard
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Global Theme Toggle */}
                <ThemeToggle />

                {/* User */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </span>

                    <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
                        {userName}
                    </span>
                </div>
            </div>
        </header>
    );
}