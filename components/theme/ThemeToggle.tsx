"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`inline-flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                    ? "border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800 hover:text-amber-300"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            } ${className}`}
        >
            {isDark ? (
                <Sun className="h-4 w-4 shrink-0 transition-transform hover:rotate-45" />
            ) : (
                <Moon className="h-4 w-4 shrink-0 transition-transform hover:-rotate-12" />
            )}
            {showLabel && (
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            )}
        </button>
    );
}
