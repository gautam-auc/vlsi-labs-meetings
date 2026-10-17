"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();
    const [joinInput, setJoinInput] = useState("");
    const [joinError, setJoinError] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleJoinSubmit = (e: FormEvent) => {
        e.preventDefault();
        setJoinError("");
        const raw = joinInput.trim();
        if (!raw) {
            setJoinError("Please enter a meeting code or link");
            return;
        }

        let cleanId = raw;
        if (raw.includes("/meet/")) {
            cleanId = raw.split("/meet/")[1].split("?")[0].split("#")[0].trim();
        }

        if (cleanId.length < 3) {
            setJoinError("Please enter a valid meeting code");
            return;
        }

        router.push(`/meet/${encodeURIComponent(cleanId)}`);
    };

    const handleCreateInstantMeeting = () => {
        setIsCreating(true);
        const randomCode = `vlsi-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 6)}`;
        router.push(`/meet/${randomCode}`);
    };

    return (
        <section className="relative overflow-hidden bg-[var(--background)] text-[var(--text)] px-4 sm:px-6 pb-20 pt-28 lg:px-8 lg:pb-28 lg:pt-36 transition-colors duration-200">
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,0.18),transparent_45%),radial-gradient(circle_at_25%_15%,rgba(99,102,241,0.15),transparent_40%)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_25%_15%,rgba(129,140,248,0.16),transparent_40%)]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
                {/* Left Column: Google Meet Style Action Console */}
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Enterprise Silicon Collaboration
                    </div>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.12]">
                        Video meetings built for{" "}
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent">
                            VLSI & hardware engineers.
                        </span>
                    </h1>

                    <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                        Crystal-clear WebRTC audio, low-latency CAD/EDA screen sharing, and peer-to-peer security. No accounts or software downloads needed for participants — simply start or join.
                    </p>

                    {/* Google Meet Dual Action Hub (New Meeting + Enter Code) */}
                    <div id="join-section" className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                        {/* New Meeting Button */}
                        <button
                            type="button"
                            onClick={handleCreateInstantMeeting}
                            disabled={isCreating}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 shrink-0 text-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{isCreating ? "Creating Room..." : "New Meeting"}</span>
                        </button>

                        {/* Enter Code or Link Input */}
                        <form
                            onSubmit={handleJoinSubmit}
                            className="flex flex-1 items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition"
                        >
                            <div className="pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                                placeholder="Enter a code or link"
                                className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!joinInput.trim()}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 disabled:opacity-40 transition"
                            >
                                Join
                            </button>
                        </form>
                    </div>

                    {joinError && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                            {joinError}
                        </p>
                    )}

                    {/* Admin Access Notice & Quick Credentials Link */}
                    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        Admin Control Center
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Authorized access: <span className="font-mono text-blue-600 dark:text-blue-400">agautamauc@gmail.com</span> / <span className="font-mono text-blue-600 dark:text-blue-400">agautamrpr@gmail.com</span>
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-100"
                            >
                                <span>Sign In as Admin</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Large Company Logo (Replacing the design box) */}
                <div className="relative mx-auto flex w-full max-w-lg items-center justify-center py-6">
                    <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-3xl" />

                    <div className="relative flex flex-col items-center justify-center p-6 text-center">
                        <img
                            src="/logo.png"
                            alt="VLSI Labs Logo"
                            className="h-auto max-h-[380px] w-auto max-w-full drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
