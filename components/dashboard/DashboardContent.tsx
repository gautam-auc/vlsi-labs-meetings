"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStoredMeetings, useUserSession } from "../../lib/session";
import StatsCard from "./StatsCard";
import MeetingCard from "./MeetingCard";
import QuickJoin from "./QuickJoin";

type Meeting = {
    title: string;
    date: string;
    time: string;
    participants: string[];
    status: "upcoming" | "live";
    id?: string;
};

const defaultMeetings: Meeting[] = [
    {
        title: "Product Development",
        date: "Today",
        time: "03:00 PM",
        participants: ["AG", "RK", "PS", "JD"],
        status: "live",
    },
    {
        title: "Client Discussion",
        date: "Tomorrow",
        time: "11:30 AM",
        participants: ["AG", "PS", "MK"],
        status: "upcoming",
    },
    {
        title: "Team Standup",
        date: "Friday",
        time: "10:00 AM",
        participants: ["AG", "RK", "PS", "JD", "MK"],
        status: "upcoming",
    },
];

export default function DashboardContent() {
    const router = useRouter();
    const user = useUserSession();
    const stored = useStoredMeetings();
    const [copied, setCopied] = useState(false);

    const allMeetings = useMemo(() => {
        const custom: Meeting[] = stored.map((m) => ({
            title: m.title,
            date: m.date || "Scheduled",
            time: m.time || "TBD",
            participants: m.participants
                ? m.participants.split(",").map((p) => p.trim().slice(0, 2).toUpperCase()).filter(Boolean)
                : ["YOU"],
            status: "upcoming",
            id: m.id,
        }));
        return [...custom, ...defaultMeetings];
    }, [stored]);

    const handleInstantMeeting = () => {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const meetingId = `VLSI-${result}`;
        router.push(`/meet/${meetingId}`);
    };

    const handleCopyPersonalLink = () => {
        const personalRoomId = `VLSI-ROOM-${user.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "DEMO"}`;
        const url = `${window.location.origin}/meet/${personalRoomId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }).catch(() => {});
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Greeting & Quick Action Header */}
            <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            VLSI Labs Workspace
                        </p>
                        {user.isGuest ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                Guest Mode
                            </span>
                        ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Active Workspace
                            </span>
                        )}
                    </div>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Welcome, {user.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {user.isGuest
                            ? "Exploring as a guest. All audio, video, screen share, and meeting tools are fully active."
                            : "Here is your team's scheduled meetings and active collaboration rooms."}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleInstantMeeting}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                        <span>⚡</span>
                        <span>Start Instant Meeting</span>
                    </button>

                    <Link
                        href="/meetings/create"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        + Schedule Meeting
                    </Link>
                </div>
            </section>

            {/* Live Stats */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    label="Active & upcoming"
                    value={String(allMeetings.length)}
                    description={`${stored.length} created by you`}
                    icon="◷"
                />

                <StatsCard
                    label="Upcoming this week"
                    value="8"
                    description="Across all projects"
                    icon="□"
                />

                <StatsCard
                    label="Team members"
                    value="24"
                    description="VLSI Labs Engineers"
                    icon="♙"
                />

                <StatsCard
                    label="Decisions logged"
                    value="18"
                    description="This month"
                    icon="✓"
                />
            </section>

            {/* Main content grid */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Left: Meeting Feed */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Your Meetings ({allMeetings.length})
                            </h3>
                            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                                Join active rooms or launch a scheduled session.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/meetings"
                            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            View all history →
                        </Link>
                    </div>

                    <div className="space-y-3.5">
                        {allMeetings.map((meeting, index) => (
                            <MeetingCard
                                key={`${meeting.title}-${meeting.date}-${index}`}
                                {...meeting}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Tools & Quick Join */}
                <aside className="space-y-6">
                    {/* Quick Join */}
                    <QuickJoin />

                    {/* Schedule Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg">
                            +
                        </div>

                        <h3 className="mt-4 font-bold text-slate-900">
                            Schedule a meeting
                        </h3>

                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                            Set an agenda, invite team members with emails, and generate a shareable link.
                        </p>

                        <Link
                            href="/meetings/create"
                            className="mt-4 block rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Schedule new meeting
                        </Link>
                    </div>

                    {/* Personal Meeting Room Link Card */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🔗</span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                                Personal Meeting Link
                            </h4>
                        </div>
                        <p className="mt-1.5 text-xs text-indigo-700/80 leading-relaxed">
                            Share your persistent meeting URL for 1-on-1s and quick ad-hoc check-ins.
                        </p>

                        <button
                            type="button"
                            onClick={handleCopyPersonalLink}
                            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                        >
                            <span>{copied ? "✓ Copied to clipboard!" : "Copy Personal Meeting URL"}</span>
                        </button>
                    </div>
                </aside>
            </section>

            {/* Bottom info banner */}
            <section className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-indigo-900">
                            Multi-device Audio, Video & Screen Sharing
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-indigo-700/80">
                            Works on laptops, tablets, and phones with browser-mesh signaling and automated presentation fallback.
                        </p>
                    </div>

                    <Link
                        href="/meetings/create"
                        className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                    >
                        Create another meeting
                    </Link>
                </div>
            </section>
        </div>
    );
}
