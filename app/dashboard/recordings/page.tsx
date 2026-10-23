"use client";

import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";

export default function RecordingsPage() {
    return (
        <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#0c0d14] text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-28 px-4 sm:px-6 py-4 sm:py-6 max-w-[1700px] mx-auto pb-24 lg:pb-8">
                <Header />

                <main className="mt-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-8">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                                ✦ Archival & Storage
                            </span>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Meeting Recordings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                View, download, and review captured team meetings.
                            </p>
                        </div>

                        {/* Honest status card per PDF guidelines */}
                        <div className="rounded-3xl border border-violet-100 dark:border-white/5 bg-white dark:bg-[#151724] p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                                Cloud Recording Storage (Coming Soon)
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                                Per the VLSI Labs specification, cloud recording requires S3-compatible object storage and permissions integration before activation.
                            </p>

                            <div className="mt-6 flex justify-center gap-3">
                                <a
                                    href="/dashboard"
                                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition active:scale-95"
                                >
                                    Back to Dashboard
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
