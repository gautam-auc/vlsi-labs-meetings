"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Meeting = {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    participants: string;
    createdAt: string;
};

export default function CreateMeetingPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState("30");
    const [participants, setParticipants] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    function generateMeetingId() {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let result = "";

        for (let i = 0; i < 8; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        return `VLSI-${result}`;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!title.trim() || !date || !time) {
            return;
        }

        setIsCreating(true);

        const meeting: Meeting = {
            id: generateMeetingId(),
            title: title.trim(),
            description: description.trim(),
            date,
            time,
            duration,
            participants: participants.trim(),
            createdAt: new Date().toISOString(),
        };

        const existingMeetings = JSON.parse(
            localStorage.getItem("vlsilabs_meetings") || "[]"
        ) as Meeting[];

        localStorage.setItem(
            "vlsilabs_meetings",
            JSON.stringify([...existingMeetings, meeting])
        );

        setTimeout(() => {
            router.push(`/meet/${meeting.id}`);
        }, 500);
    }

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                    <a href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                            V
                        </div>

                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                VLSI Labs
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Meetings
                            </p>
                        </div>
                    </a>

                    <a
                        href="/dashboard"
                        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                        ← Dashboard
                    </a>
                </div>
            </header>

            {/* Form */}
            <div className="mx-auto max-w-3xl px-6 py-12">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-indigo-600">
                        New meeting
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                        Create a meeting
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Create a meeting and generate a unique link that you can share
                        with your team.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Meeting title
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="e.g. Product Development Discussion"
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            placeholder="What will this meeting be about?"
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Date + Time */}
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="date"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Date
                            </label>

                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="time"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Time
                            </label>

                            <input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="mt-6">
                        <label
                            htmlFor="duration"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Duration
                        </label>

                        <select
                            id="duration"
                            value={duration}
                            onChange={(event) => setDuration(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="90">90 minutes</option>
                            <option value="120">2 hours</option>
                        </select>
                    </div>

                    {/* Participants */}
                    <div className="mt-6">
                        <label
                            htmlFor="participants"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Participants
                        </label>

                        <input
                            id="participants"
                            type="text"
                            value={participants}
                            onChange={(event) => setParticipants(event.target.value)}
                            placeholder="alex@example.com, team@example.com"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />

                        <p className="mt-2 text-xs text-slate-400">
                            Separate multiple email addresses with commas.
                        </p>
                    </div>

                    {/* Information */}
                    <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                        <p className="text-sm font-semibold text-indigo-700">
                            Meeting link
                        </p>

                        <p className="mt-1 text-xs leading-5 text-indigo-600/80">
                            A unique meeting ID and shareable link will be generated when
                            you create the meeting.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <a
                            href="/dashboard"
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </a>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCreating ? "Creating..." : "Create meeting"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}