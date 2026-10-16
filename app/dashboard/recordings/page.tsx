"use client";

import Link from "next/link";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { Video, Info } from "lucide-react";

export default function RecordingsPage() {
    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                Meeting Recordings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Archive of recorded technical sessions, architecture syncs, and tapeout reviews.
                            </p>
                        </div>

                        <Link
                            href="/meetings/create"
                            className="inline-flex items-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                        >
                            + Start New Meeting
                        </Link>
                    </div>

                    {/* Honest Architecture & Status Notice (Per Spec) */}
                    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-6 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                                    Cloud Recording & Storage Infrastructure Status
                                </h3>
                                <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                                    In strict accordance with the VLSI Labs Meetings production specification: live audio and video are transmitted over encrypted peer-to-peer WebRTC mesh channels. Production cloud recordings require an external S3-compatible object storage bucket and dedicated media server ingestion pipeline before recording archives can be persisted and played back.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Empty State / Real Recordings List */}
                    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <Video className="h-6 w-6" />
                        </div>
                        <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                            No Recordings Available
                        </h4>
                        <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                            Recorded meetings will appear here once an S3 storage bucket is connected to your workspace backend.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <Link
                                href="/dashboard/meetings"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                View Scheduled Meetings
                            </Link>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                            >
                                Return to Dashboard →
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
