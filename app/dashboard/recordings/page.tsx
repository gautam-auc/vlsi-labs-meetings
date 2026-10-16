"use client";

import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";

export default function RecordingsPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Meeting Recordings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                View, download, and review captured team meetings.
                            </p>
                        </div>

                        {/* Honest status card per PDF guidelines */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                                Cloud Recording Storage (Coming Soon)
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                                Per the VLSI Labs specification, cloud recording requires S3-compatible object storage and permissions integration before activation.
                            </p>

                            <div className="mt-6 flex justify-center gap-3">
                                <a
                                    href="/dashboard"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
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
