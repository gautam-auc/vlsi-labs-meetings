"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinInput, setJoinInput] = useState("");
    const [joinError, setJoinError] = useState("");

    function handleJoinSubmit(e: FormEvent) {
        e.preventDefault();
        setJoinError("");
        const raw = joinInput.trim();
        if (!raw) {
            setJoinError("Please enter a meeting link or code.");
            return;
        }

        // Clean link or code
        let meetingId = raw;
        if (raw.includes("/meet/")) {
            meetingId = raw.split("/meet/")[1].split("?")[0].split("#")[0].trim();
        }

        if (meetingId.length < 3) {
            setJoinError("Please enter a valid meeting ID (e.g. VLSI-XXXXXXXX).");
            return;
        }

        router.push(`/meet/${encodeURIComponent(meetingId)}`);
    }

    return (
        <section className="relative overflow-hidden bg-[var(--background)] text-[var(--text)] px-6 pb-20 pt-32 lg:px-8 lg:pb-28 lg:pt-40 transition-colors duration-200">
            {/* Ambient gradients */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_70%_25%,rgba(37,99,235,0.15),transparent_40%),radial-gradient(circle_at_25%_15%,rgba(99,102,241,0.12),transparent_35%)] dark:bg-[radial-gradient(circle_at_70%_25%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_25%_15%,rgba(129,140,248,0.14),transparent_35%)]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Meetings built for focused teams
                    </div>

                    <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                        Meet with purpose.{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Move work forward.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                        A calmer workspace for planning, decisions, and follow-up. Start a
                        video meeting in seconds and keep every conversation connected to
                        the work that follows.
                    </p>

                    {/* PDF Page 6 & 7 Actions: Create Meeting + Join Meeting */}
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link
                            href="/meetings/create"
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Meeting
                        </Link>

                        <button
                            type="button"
                            onClick={() => setShowJoinModal(true)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <svg className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Meeting
                        </button>
                    </div>

                    {/* Quick Join Modal / Dropdown */}
                    {showJoinModal && (
                        <div className="mt-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-slate-900/90 p-4 backdrop-blur-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                                    Join an active session
                                </span>
                                <button
                                    type="button"
                                    onClick={() => { setShowJoinModal(false); setJoinError(""); }}
                                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleJoinSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={joinInput}
                                    onChange={(e) => setJoinInput(e.target.value)}
                                    placeholder="Enter meeting code or link (e.g. VLSI-DEMO)"
                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                                >
                                    Join →
                                </button>
                            </form>
                            {joinError && (
                                <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                                    {joinError}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-10 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex -space-x-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 text-[10px] font-bold text-blue-700">AG</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-amber-100 text-[10px] font-bold text-amber-700">RK</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-emerald-100 text-[10px] font-bold text-emerald-700">PS</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-rose-100 text-[10px] font-bold text-rose-700">JD</span>
                        </div>
                        Trusted by high-performance VLSI engineering teams.
                    </div>
                </div>

                {/* Right side live meeting preview matching Reference C & A */}
                <div className="relative mx-auto w-full max-w-2xl">
                    <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-blue-500/20 blur-3xl" />
                    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl shadow-slate-900/15">
                        <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold">V</span>
                                <div>
                                    <p className="text-sm font-semibold">Product Planning Sync</p>
                                    <p className="text-xs text-slate-400">Live WebRTC · 4 participants</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-emerald-400/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                                ● Live
                            </span>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="relative aspect-[1.28] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 p-4">
                                <div className="absolute inset-x-5 top-6 h-24 rounded-full bg-white/10 blur-2xl" />
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-sm font-semibold text-white">A. Gautam</p>
                                    <p className="mt-1 text-xs text-blue-100">You (Host)</p>
                                </div>
                                <span className="absolute top-3 right-3 rounded-md bg-black/40 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                                    🎤 Active
                                </span>
                            </div>
                            <div className="relative aspect-[1.28] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700/60">
                                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-200/80 dark:bg-amber-500/20" />
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Priya Shah</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Verification Lead</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Action Items & Decisions
                                </p>
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    3 captured
                                </span>
                            </div>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800/80">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    WebRTC low-latency signaling connected to Render
                                </div>
                                <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800/80">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    Global Day/Night theme tokens verified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
