"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickJoin() {
    const router = useRouter();
    const [code, setCode] = useState("");

    const handleJoin = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (!trimmed) return;
        // If user entered full URL or code
        const meetingId = trimmed.includes("/")
            ? trimmed.split("/").pop() || trimmed
            : trimmed;

        router.push(`/meet/${meetingId}`);
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-indigo-400">
                Quick join
            </p>

            <h3 className="mt-2 text-lg font-bold">
                Have a meeting link?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter a meeting code to join an existing meeting room.
            </p>

            <form onSubmit={handleJoin} className="mt-5 flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. VLSI-ABC123"
                    className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    Join
                </button>
            </form>
        </div>
    );
}
