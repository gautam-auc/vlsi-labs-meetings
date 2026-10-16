"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Video, AlertCircle } from "lucide-react";

interface JoinMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
    const [meetingInput, setMeetingInput] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    if (!isOpen) return null;

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        let raw = meetingInput.trim();
        if (!raw) {
            setError("Please enter a meeting code or share URL.");
            return;
        }

        // Handle full URL paste like https://.../meet/VLSI-ABCDEF
        if (raw.includes("/meet/")) {
            const parts = raw.split("/meet/");
            raw = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
        }

        // Sanitize code
        const sanitized = raw.replace(/[^a-zA-Z0-9-]/g, "");
        if (sanitized.length < 4) {
            setError("Invalid meeting code format. Example: VLSI-ABC12345");
            return;
        }

        onClose();
        router.push(`/meet/${sanitized}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <Video className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Join Live Meeting
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Enter a share code or paste an invitation link.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleJoin} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Meeting ID or Link
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. VLSI-K9P2X4M1 or /meet/..."
                            value={meetingInput}
                            onChange={(e) => {
                                setMeetingInput(e.target.value);
                                if (error) setError("");
                            }}
                            autoFocus
                            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                        >
                            <span>Enter Room</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
