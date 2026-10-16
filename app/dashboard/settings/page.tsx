"use client";

import { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { useUserSession, clearUserSession } from "../../../lib/session";
import { useTheme } from "../../../components/theme/ThemeProvider";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Check } from "lucide-react";

export default function SettingsPage() {
    const user = useUserSession();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const [savedNotice, setSavedNotice] = useState(false);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [activeTab, setActiveTab] = useState<"general" | "appearance" | "devices">("appearance");

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    const handleSignOut = () => {
        clearUserSession();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Workspace Settings
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage your personal profile, day/night appearance, and meeting preferences.
                        </p>
                    </div>

                    {/* Notification Banner */}
                    {savedNotice && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <Check className="h-4 w-4" />
                            Settings preferences saved successfully.
                        </div>
                    )}

                    {/* Settings Navigation Tabs */}
                    <div className="mb-8 flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab("appearance")}
                            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                                activeTab === "appearance"
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                    : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            Appearance & Theme
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("general")}
                            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                                activeTab === "general"
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                    : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            Profile Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("devices")}
                            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                                activeTab === "devices"
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                    : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            Devices & Audio
                        </button>
                    </div>

                    {/* TAB 1: APPEARANCE & THEME (REQUIRED SPEC) */}
                    {activeTab === "appearance" && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Day / Night Theme Preference
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Choose how VLSI Labs Meetings looks across all routes and devices. Persists across browser refreshes.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Light Mode Option */}
                                <button
                                    type="button"
                                    onClick={() => setTheme("light")}
                                    className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                                        theme === "light"
                                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/30 dark:bg-slate-800"
                                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
                                    }`}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-xs border border-slate-200">
                                        <Sun className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Light Theme (Day)
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Crisp slate background (#F8FAFC) with navy text and high contrast panels.
                                    </p>
                                    {theme === "light" && (
                                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                            Active
                                        </span>
                                    )}
                                </button>

                                {/* Dark Mode Option */}
                                <button
                                    type="button"
                                    onClick={() => setTheme("dark")}
                                    className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                                        theme === "dark"
                                            ? "border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/30"
                                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
                                    }`}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800">
                                        <Moon className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Dark Theme (Night)
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Deep navy/slate (#0B1120) background with electric blue/indigo accents.
                                    </p>
                                    {theme === "dark" && (
                                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                            Active
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PROFILE DETAILS */}
                    {activeTab === "general" && (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    User Profile
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Your display information shown in meetings and team rosters.
                                </p>

                                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Role / Permissions
                                        </label>
                                        <input
                                            type="text"
                                            value={user.role}
                                            disabled
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* TAB 3: DEVICES */}
                    {activeTab === "devices" && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Audio & Video Devices
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Device checks and hardware permissions are requested directly when entering a live meeting room.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                            Microphone & Audio Input
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Permission checked upon entering /meet/[meetingId].
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                        Ready
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                            Webcam Video
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Local video preview enabled on the pre-join screen.
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                        Ready
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Session Sign Out Section */}
                    <div className="mt-8 rounded-2xl border border-rose-200/80 bg-rose-50/50 p-6 dark:border-rose-900/50 dark:bg-rose-950/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-rose-950 dark:text-rose-300">
                                    Sign Out of Workspace
                                </h4>
                                <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">
                                    Clear your local session and return to the login screen.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-500"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
