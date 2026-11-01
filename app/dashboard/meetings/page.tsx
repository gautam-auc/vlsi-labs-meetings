"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import MeetingCard from "../../../components/dashboard/MeetingCard";

interface MeetingItem {
    id: string;
    title: string;
    date: string;
    time: string;
    participants: string[];
    status: "upcoming" | "live" | "completed";
}

const defaultMeetings: MeetingItem[] = [];

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<MeetingItem[]>(defaultMeetings);
    const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "completed">("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadMeetings() {
            let apiMeetings: MeetingItem[] = [];
            try {
                const token = localStorage.getItem("vlsilabs_token");
                const res = await fetch("/api/meetings", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.meetings)) {
                        apiMeetings = data.meetings.map((m: any) => ({
                            id: m.meetingId || m.id,
                            title: m.title || "Meeting",
                            date: m.date || "Scheduled",
                            time: m.time || "TBD",
                            participants: Array.isArray(m.participants) ? m.participants : ["Host"],
                            status: m.status || "upcoming",
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch meetings from API, using local fallback:", err);
            }

            if (isMounted) {
                const combined = [...apiMeetings, ...defaultMeetings];
                const unique = combined.filter((m, idx, arr) => arr.findIndex((item) => item.id === m.id) === idx);
                setMeetings(unique);
            }
        }

        loadMeetings();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleDelete = async (id: string) => {
        const updated = meetings.filter((m) => m.id !== id);
        setMeetings(updated);

        try {
            const token = localStorage.getItem("vlsilabs_token");
            await fetch(`/api/meetings/${encodeURIComponent(id)}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
        } catch (err) {
            console.error("API meeting delete error:", err);
        }

        try {
            const saved = localStorage.getItem("vlsilabs_meetings");
            if (saved) {
                const parsed = JSON.parse(saved);
                const filteredSaved = parsed.filter((m: any) => (m.id || m.meetingId) !== id);
                localStorage.setItem("vlsilabs_meetings", JSON.stringify(filteredSaved));
            }
        } catch (_) {}
    };

    const filteredMeetings = meetings.filter((meeting) => {
        // Status filter
        if (filter !== "all" && meeting.status !== filter) return false;
        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                meeting.title.toLowerCase().includes(q) ||
                meeting.id.toLowerCase().includes(q) ||
                meeting.date.toLowerCase().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#0c0d14] text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-28 px-4 sm:px-6 py-4 sm:py-6 max-w-[1700px] mx-auto pb-24 lg:pb-8">
                <Header />

                <main className="mt-6">
                    <div className="mx-auto max-w-7xl">

                        {/* Page heading */}
                        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                                    ✦ Workspace Schedules
                                </span>

                                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    All Meetings
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage, schedule, and join active and upcoming team sessions.
                                </p>
                            </div>

                            <a
                                href="/meetings/create"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition active:scale-95"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Create meeting
                            </a>
                        </section>

                        {/* Search and Filters toolbar matching Behance Design */}
                        <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Search bar */}
                            <div className="relative max-w-md flex-1">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-violet-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, code or date..."
                                    className="w-full rounded-2xl border border-violet-100 dark:border-white/10 bg-white dark:bg-[#151724] py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-sm transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Status filter tabs */}
                            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-violet-100 dark:border-white/10 bg-white dark:bg-[#151724] p-1.5 shadow-sm">
                                {(["all", "live", "upcoming", "completed"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setFilter(tab)}
                                        className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition ${
                                            filter === tab
                                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {tab === "all" ? "All Meetings" : tab}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Meeting list */}
                        <section className="mt-6 space-y-4">
                            {filteredMeetings.length > 0 ? (
                                filteredMeetings.map((meeting) => (
                                    <MeetingCard
                                        key={meeting.id}
                                        meetingId={meeting.id}
                                        title={meeting.title}
                                        date={meeting.date}
                                        time={meeting.time}
                                        participants={meeting.participants}
                                        status={meeting.status}
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-violet-200 dark:border-white/10 bg-white/70 dark:bg-[#151724]/70 p-12 text-center backdrop-blur-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                                        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                                        No meetings found
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {searchQuery
                                            ? `No results matching "${searchQuery}". Try another keyword.`
                                            : `You don't have any ${filter} meetings right now.`}
                                    </p>
                                    <div className="mt-5">
                                        <a
                                            href="/meetings/create"
                                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/30 hover:bg-violet-700 transition"
                                        >
                                            + Schedule a Meeting
                                        </a>
                                    </div>
                                </div>
                            )}
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}
