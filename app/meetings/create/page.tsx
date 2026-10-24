"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../../components/ThemeToggle";
import { getPublicMeetingUrl } from "@/lib/utils";

type Meeting = {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    participants: string;
    createdAt: string;
    mode: "instant" | "scheduled";
};

export default function CreateMeetingPage() {
    const router = useRouter();

    const [mode, setMode] = useState<"instant" | "scheduled">("instant");
    const [title, setTitle] = useState("Technical Sync");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [time, setTime] = useState("10:00");
    const [duration, setDuration] = useState("30");
    const [participants, setParticipants] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);
    const [copied, setCopied] = useState(false);

    function generateMeetingId() {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `VLSI-${result}`;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!title.trim()) return;

        setIsCreating(true);

        const newId = generateMeetingId();
        const meeting: Meeting = {
            id: newId,
            title: title.trim(),
            description: description.trim(),
            date: mode === "instant" ? "Today" : date,
            time: mode === "instant" ? "Now" : time,
            duration,
            participants: participants.trim(),
            createdAt: new Date().toISOString(),
            mode,
        };

        try {
            const hostName = localStorage.getItem("vlsilabs_user_name") || "A. Gautam";
            const hostEmail = localStorage.getItem("vlsilabs_user_email") || "";

            const res = await fetch("/api/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: meeting.title,
                    description: meeting.description,
                    date: meeting.date,
                    time: meeting.time,
                    duration: meeting.duration,
                    mode: meeting.mode,
                    participants: meeting.participants,
                    hostName,
                    hostEmail,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.meeting?.meetingId) {
                    meeting.id = data.meeting.meetingId;
                }
            }
        } catch (err) {
            console.error("Failed to post meeting to API, using local sync:", err);
        }

        const existingMeetings = JSON.parse(
            localStorage.getItem("vlsilabs_meetings") || "[]"
        ) as Meeting[];

        localStorage.setItem(
            "vlsilabs_meetings",
            JSON.stringify([meeting, ...existingMeetings])
        );

        setIsCreating(false);

        if (mode === "instant") {
            router.push(`/meet/${meeting.id}`);
        } else {
            setCreatedMeeting(meeting);
        }
    }

    const handleCopyInvite = async () => {
        if (!createdMeeting) return;
        const url = getPublicMeetingUrl(createdMeeting.id);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                    <a href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/20">
                            V
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                VLSI Labs
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Meetings
                            </p>
                        </div>
                    </a>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <a
                            href="/dashboard"
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            ← Dashboard
                        </a>
                    </div>
                </div>
            </header>

            {/* Container */}
            <div className="mx-auto max-w-3xl px-6 py-12">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        New session
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Create a Meeting
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Generate an instant WebRTC room or schedule a future engineering discussion.
                    </p>
                </div>

                {/* Created success modal / card */}
                {createdMeeting ? (
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-8 shadow-sm">
                        <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300 font-bold text-lg">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm">
                                ✓
                            </span>
                            Meeting Scheduled Successfully!
                        </div>

                        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                            <div>
                                <span className="text-xs uppercase font-semibold text-slate-400">Title</span>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{createdMeeting.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs uppercase font-semibold text-slate-400">Meeting ID</span>
                                    <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{createdMeeting.id}</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase font-semibold text-slate-400">Date & Time</span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{createdMeeting.date} · {createdMeeting.time}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCopyInvite}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                            >
                                {copied ? "✓ Invite Link Copied!" : "Copy Invite Link"}
                            </button>
                            <a
                                href={`/meet/${createdMeeting.id}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                Enter Room Now →
                            </a>
                            <a
                                href="/dashboard/meetings"
                                className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-2"
                            >
                                Back to Meetings
                            </a>
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8"
                    >
                        {/* Mode toggle */}
                        <div className="mb-6 flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950">
                            <button
                                type="button"
                                onClick={() => setMode("instant")}
                                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                                    mode === "instant"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                ⚡ Instant Meeting
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("scheduled")}
                                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                                    mode === "scheduled"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                📅 Schedule for Later
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label
                                htmlFor="title"
                                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                            >
                                Meeting title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. RTL Verification Sync"
                                required
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label
                                htmlFor="description"
                                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                            >
                                Agenda / Description <span className="text-xs font-normal text-slate-400">(Optional)</span>
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Key goals, architecture review notes..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* Scheduled options */}
                        {mode === "scheduled" && (
                            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="date"
                                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                    >
                                        Date
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="time"
                                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                    >
                                        Time
                                    </label>
                                    <input
                                        id="time"
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Duration */}
                        <div className="mt-6">
                            <label
                                htmlFor="duration"
                                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                            >
                                Expected Duration
                            </label>
                            <select
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="90">1.5 hours</option>
                            </select>
                        </div>

                        {/* Participants */}
                        <div className="mt-6">
                            <label
                                htmlFor="participants"
                                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                            >
                                Invite Teammates <span className="text-xs font-normal text-slate-400">(Optional)</span>
                            </label>
                            <input
                                id="participants"
                                type="text"
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                                placeholder="agautamrpr@gmail.com, team@vlsilabs.ai"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <a
                                href="/dashboard"
                                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </a>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition disabled:opacity-60"
                            >
                                {isCreating
                                    ? "Starting..."
                                    : mode === "instant"
                                    ? "Start Instant Meeting →"
                                    : "Schedule Meeting"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}