"use client";

import { useState } from "react";

type MeetingCardProps = {
    title: string;
    date: string;
    time: string;
    participants: string[];
    status: "upcoming" | "live" | "completed";
    meetingId?: string;
    onDelete?: (id: string) => void;
};

export default function MeetingCard({
    title,
    date,
    time,
    participants,
    status,
    meetingId = "VLSI-DEMO",
    onDelete,
}: MeetingCardProps) {
    const [copied, setCopied] = useState(false);
    const joinHref = `/meet/${meetingId}`;

    const handleCopy = async () => {
        const fullUrl = `${window.location.origin}/meet/${meetingId}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Meeting information */}
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/80 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {title.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {title}
                            </h3>
                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                {meetingId}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {date} · {time}
                        </p>

                        <div className="mt-3 flex items-center">
                            {participants.map((participant, index) => (
                                <div
                                    key={`${participant}-${index}`}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300 ${index > 0 ? "-ml-2" : ""
                                        }`}
                                >
                                    {participant}
                                </div>
                            ))}

                            <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                                {participants.length} participants
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status and actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {status === "live" ? (
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ● Live
                        </span>
                    ) : status === "completed" ? (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Completed
                        </span>
                    ) : (
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            Scheduled
                        </span>
                    )}

                    {/* Copy Link button per PDF Page 6 & 7 */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        title="Copy shareable meeting URL"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                        {copied ? (
                            <>
                                <span className="text-emerald-500">✓</span> Copied!
                            </>
                        ) : (
                            <>
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>

                    <a
                        href={joinHref}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
                    >
                        {status === "live" ? "Join room" : "Open"}
                    </a>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm(`Delete meeting "${title}"?`)) {
                                    onDelete(meetingId);
                                }
                            }}
                            title="Delete meeting"
                            className="p-2 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}