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

const defaultMeetings: MeetingItem[] = [
    {
        id: "VLSI-PROD-SYNC",
        title: "Product Development",
        date: "Today",
        time: "03:00 PM",
        participants: ["AG", "RK", "PS", "JD"],
        status: "live",
    },
    {
        id: "VLSI-CLIENT-REVIEW",
        title: "Client Technical Review",
        date: "Tomorrow",
        time: "11:30 AM",
        participants: ["AG", "PS", "MK"],
        status: "upcoming",
    },
    {
        id: "VLSI-STANDUP-ENG",
        title: "Engineering Team Standup",
        date: "Friday",
        time: "10:00 AM",
        participants: ["AG", "RK", "PS", "JD", "MK"],
        status: "upcoming",
    },
    {
        id: "VLSI-WEEKLY-PLAN",
        title: "Weekly Planning & Retrospective",
        date: "Last Monday",
        time: "04:00 PM",
        participants: ["AG", "RK", "PS"],
        status: "completed",
    },
];

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<MeetingItem[]>(defaultMeetings);
    const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "completed">("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("vlsilabs_meetings");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const mapped: MeetingItem[] = parsed.map((m: any) => ({
                        id: m.id || `VLSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                        title: m.title || "Custom Meeting",
                        date: m.date || "Scheduled",
                        time: m.time || "TBD",
                        participants: m.participants ? m.participants.split(",").map((p: string) => p.trim()) : ["AG"],
                        status: "upcoming",
                    }));
                    setMeetings([...mapped, ...defaultMeetings]);
                }
            }
        } catch (_) {}
    }, []);

    const handleDelete = (id: string) => {
        const updated = meetings.filter((m) => m.id !== id);
        setMeetings(updated);
        try {
            const saved = localStorage.getItem("vlsilabs_meetings");
            if (saved) {
                const parsed = JSON.parse(saved);
                const filteredSaved = parsed.filter((m: any) => m.id !== id);
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
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">

                        {/* Page heading */}
                        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    Workspace
                                </p>

                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Meetings
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage, schedule, and join active and upcoming team sessions.
                                </p>
                            </div>

                            <a
                                href="/meetings/create"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Create meeting
                            </a>
                        </section>

                        {/* Search and Filters toolbar matching Reference B */}
                        <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Search bar */}
                            <div className="relative max-w-md flex-1">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, code or date..."
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Status filter tabs */}
                            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
                                {(["all", "live", "upcoming", "completed"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setFilter(tab)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                                            filter === tab
                                                ? "bg-blue-600 text-white shadow-sm"
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
                                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
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
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
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