"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatsCard from "../../components/dashboard/StatsCard";
import MeetingCard from "../../components/dashboard/MeetingCard";

const initialMeetings: any[] = [];

export default function DashboardPage() {
    const router = useRouter();
    const [meetings, setMeetings] = useState(initialMeetings);
    const [joinCode, setJoinCode] = useState("");
    const [joinError, setJoinError] = useState("");
    const [greeting, setGreeting] = useState("Good morning");
    const [userName, setUserName] = useState("A. Gautam");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 17) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        const storedName = localStorage.getItem("vlsilabs_user_name");
        if (storedName) setUserName(storedName);
    }, []);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/meetings");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.meetings) && data.meetings.length > 0) {
                        setMeetings(
                            data.meetings.map((m: any) => ({
                                title: m.title || "Meeting",
                                date: m.date || "Today",
                                time: m.time || "Now",
                                participants: Array.isArray(m.participants) ? m.participants : ["Host"],
                                status: m.status || "upcoming",
                                meetingId: m.meetingId || m.id,
                            }))
                        );
                        return;
                    }
                }
            } catch {}

            try {
                const saved = localStorage.getItem("vlsilabs_meetings");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMeetings(
                            parsed.map((m: any) => ({
                                title: m.title || "Custom Meeting",
                                date: m.date || "Scheduled",
                                time: m.time || "TBD",
                                participants: m.participants ? (typeof m.participants === "string" ? m.participants.split(",").map((p: string) => p.trim()) : m.participants) : ["Host"],
                                status: "upcoming" as const,
                                meetingId: m.id || m.meetingId || "session",
                            }))
                        );
                        return;
                    }
                }
            } catch {}
            setMeetings([]);
        }
        load();
    }, []);

    const handleQuickJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const code = joinCode.trim();
        if (!code) {
            setJoinError("Please enter a meeting code or ID");
            return;
        }
        // Extract ID if a full URL was pasted
        const cleanId = code.includes("/meet/") ? code.split("/meet/")[1].split("?")[0] : code;
        router.push(`/meet/${cleanId}`);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">

                        {/* Welcome */}
                        <section className="mb-8">
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                VLSI Labs Workspace
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {greeting}, {userName}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Here&apos;s what&apos;s happening with your meetings today.
                            </p>
                        </section>

                        {/* Stats */}
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                label="Today's meetings"
                                value="3"
                                description="2 upcoming"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />

                            <StatsCard
                                label="Upcoming"
                                value="8"
                                description="This week"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />

                            <StatsCard
                                label="Team members"
                                value="24"
                                description="Active members"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                            />

                            <StatsCard
                                label="Completed"
                                value="18"
                                description="This month"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        </section>

                        {/* Main content */}
                        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">

                            {/* Meetings */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Upcoming meetings
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Your team&apos;s scheduled meetings.
                                        </p>
                                    </div>

                                    <a
                                        href="/dashboard/meetings"
                                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    >
                                        View all
                                    </a>
                                </div>

                                <div className="space-y-4">
                                    {meetings.length > 0 ? (
                                        meetings.map((meeting) => (
                                            <MeetingCard
                                                key={`${meeting.meetingId || meeting.title}-${meeting.date}`}
                                                {...meeting}
                                            />
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 text-center">
                                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                                                No meetings scheduled
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Your workspace is fresh. Start an instant meeting or schedule one.
                                            </p>
                                            <a
                                                href="/meetings/create"
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                                            >
                                                + Schedule Meeting
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right panel */}
                            <aside className="space-y-6">

                                {/* Schedule Card */}
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>

                                    <h3 className="mt-5 font-bold text-slate-900 dark:text-white">
                                        Schedule a meeting
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                        Create a meeting and share the link with your team.
                                    </p>

                                    <a
                                        href="/meetings/create"
                                        className="mt-5 block rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition"
                                    >
                                        Create meeting
                                    </a>
                                </div>

                                {/* Quick Join - Active & Functional */}
                                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                                        Quick join
                                    </p>

                                    <h3 className="mt-2 text-lg font-bold">
                                        Have a meeting link?
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Enter a meeting code or paste URL to join instantly.
                                    </p>

                                    <form onSubmit={handleQuickJoin} className="mt-5 space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={joinCode}
                                                onChange={(e) => {
                                                    setJoinCode(e.target.value);
                                                    if (joinError) setJoinError("");
                                                }}
                                                placeholder="e.g. dev-sync-123"
                                                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />

                                            <button
                                                type="submit"
                                                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                                            >
                                                Join
                                            </button>
                                        </div>

                                        {joinError && (
                                            <p className="text-xs text-rose-400">{joinError}</p>
                                        )}
                                    </form>
                                </div>

                            </aside>
                        </section>

                        {/* Bottom information banner */}
                        <section className="mt-8 rounded-2xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/80 dark:bg-blue-950/30 p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                        Keep your meetings productive
                                    </p>

                                    <p className="mt-1 text-sm text-blue-600/80 dark:text-blue-300/80">
                                        Capture decisions and action items after every meeting.
                                    </p>
                                </div>

                                <a
                                    href="/dashboard/meetings"
                                    className="shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-400 shadow-sm transition hover:bg-blue-50 dark:hover:bg-slate-800"
                                >
                                    View meeting history
                                </a>
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}