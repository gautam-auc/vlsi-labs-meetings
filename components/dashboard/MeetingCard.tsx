"use client";

import { useState } from "react";
import { getPublicMeetingUrl } from "@/lib/utils";

type MeetingCardProps = {
    title: string;
    date: string;
    time: string;
    participants: string[];
    status: "upcoming" | "live" | "completed";
    meetingId?: string;
    onDelete?: (id: string) => void;
    onSelect?: () => void;
    isSelected?: boolean;
};

export default function MeetingCard({
    title,
    date,
    time,
    participants,
    status,
    meetingId = "VLSI-DEMO",
    onDelete,
    onSelect,
    isSelected = false,
}: MeetingCardProps) {
    const [copied, setCopied] = useState(false);
    const joinHref = `/meet/${meetingId}`;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const fullUrl = getPublicMeetingUrl(meetingId);
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            onClick={onSelect}
            className={`group rounded-2xl sm:rounded-3xl border transition-all duration-200 p-4 sm:p-5 cursor-pointer ${
                isSelected
                    ? "border-[#7c3aed] bg-purple-50/70 dark:bg-purple-950/40 shadow-md ring-1 ring-purple-500/30"
                    : "border-purple-100/80 dark:border-purple-900/40 bg-white/90 dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg shadow-sm"
            }`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Meeting information */}
                <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-pink-500 text-sm font-bold text-white shadow-md shadow-purple-900/20">
                        {title.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-800 dark:text-white truncate text-sm sm:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {title}
                            </h3>
                            <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-purple-700 dark:text-purple-300">
                                {meetingId}
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {date} · {time}
                        </p>

                        <div className="mt-2.5 flex items-center">
                            {participants.slice(0, 3).map((participant, index) => (
                                <div
                                    key={`${participant}-${index}`}
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-tr from-purple-200 to-indigo-100 dark:from-purple-900 dark:to-indigo-950 text-[8px] font-bold text-purple-800 dark:text-purple-200 ${
                                        index > 0 ? "-ml-2" : ""
                                    }`}
                                >
                                    {participant.charAt(0).toUpperCase()}
                                </div>
                            ))}

                            {participants.length > 3 && (
                                <span className="ml-1.5 rounded-full bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300">
                                    +{participants.length - 3}
                                </span>
                            )}

                            <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500">
                                {participants.length} member{participants.length === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {status === "live" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                        </span>
                    ) : (
                        <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                            Scheduled
                        </span>
                    )}

                    {/* Copy Link Button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        title="Copy shareable meeting URL"
                        className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition shadow-sm"
                    >
                        {copied ? (
                            <>
                                <span className="text-emerald-500 font-bold">✓</span> Copied
                            </>
                        ) : (
                            <>
                                <svg className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                            </>
                        )}
                    </button>

                    {/* Join / Open CTA */}
                    <a
                        href={joinHref}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-[#6d28d9] hover:bg-[#5b21b6] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-900/20 transition hover:scale-105 active:scale-95"
                    >
                        {status === "live" ? "Join Room" : "Open"}
                    </a>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete meeting "${title}"?`)) {
                                    onDelete(meetingId);
                                }
                            }}
                            title="Delete meeting"
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40"
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