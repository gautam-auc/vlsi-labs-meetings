"use client";

import { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { useTheme } from "../../../components/ThemeProvider";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState("A. Gautam");
    const [email, setEmail] = useState("gautam@vlsilabs.ai");
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-4xl space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Settings & Preferences
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Manage your profile details and workspace appearance.
                            </p>
                        </div>

                        {savedNotice && (
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                ✓ Preferences saved successfully.
                            </div>
                        )}

                        {/* Profile Settings */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                User Profile
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Your display name and primary contact email.
                            </p>

                            <form onSubmit={handleSave} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
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
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        {/* Appearance / Theme Settings */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Appearance & Theme
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Select your preferred UI theme across the entire application.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setTheme("light")}
                                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${theme === "light"
                                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-600"
                                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                        ☀️
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">Light Mode</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Clean slate background</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTheme("dark")}
                                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${theme === "dark"
                                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-600"
                                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                                        🌙
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">Dark Mode</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">High contrast navy/slate</p>
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
