"use client";

import { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { useTheme } from "../../../components/ThemeProvider";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState("A. Gautam");
    const [email, setEmail] = useState("agautamrpr@gmail.com");
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#0c0d14] text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-28 px-4 sm:px-6 py-4 sm:py-6 max-w-[1700px] mx-auto pb-24 lg:pb-8">
                <Header />

                <main className="mt-6">
                    <div className="mx-auto max-w-4xl space-y-8">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                                ✦ Workspace Configuration
                            </span>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Settings & Preferences
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Manage your profile details and workspace appearance.
                            </p>
                        </div>

                        {savedNotice && (
                            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm animate-fade-in">
                                ✓ Preferences saved successfully.
                            </div>
                        )}

                        {/* Profile Settings */}
                        <div className="rounded-3xl border border-violet-100 dark:border-white/5 bg-white dark:bg-[#151724] p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                User Profile
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Your display name and primary contact email.
                            </p>

                            <form onSubmit={handleSave} className="mt-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-violet-100 dark:border-white/10 bg-slate-50 dark:bg-[#0c0d14] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Work Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-violet-100 dark:border-white/10 bg-slate-50 dark:bg-[#0c0d14] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        {/* Appearance / Theme Settings */}
                        <div className="rounded-3xl border border-violet-100 dark:border-white/5 bg-white dark:bg-[#151724] p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Appearance & Theme
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Select your preferred UI theme across the entire application.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setTheme("light")}
                                    className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${theme === "light"
                                            ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/20 ring-2 ring-violet-600 shadow-md shadow-violet-500/10"
                                            : "border-violet-100 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-900/40"
                                        }`}
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 text-xl shadow-sm">
                                        ☀️
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Light Mode</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Pastel lavender & crisp white</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTheme("dark")}
                                    className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${theme === "dark"
                                            ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/20 ring-2 ring-violet-600 shadow-md shadow-violet-500/10"
                                            : "border-violet-100 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-900/40"
                                        }`}
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-950 text-violet-300 text-xl shadow-sm border border-violet-800/40">
                                        🌙
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Deep obsidian & glowing neon violet</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
