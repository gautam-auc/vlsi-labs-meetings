"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUserSession } from "../../lib/session";

type GoogleAuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
    redirectUrl?: string;
};

export default function GoogleAuthModal({
    isOpen,
    onClose,
    redirectUrl = "/dashboard",
}: GoogleAuthModalProps) {
    const router = useRouter();
    const [customEmail, setCustomEmail] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState<string | null>(null);

    if (!isOpen) return null;

    const presetGoogleAccounts = [
        {
            name: "A. Gautam",
            email: "agautamauc@gmail.com",
            role: "Super Admin",
            domain: "VLSI Labs Enterprise",
            avatarColor: "bg-indigo-600",
        },
        {
            name: "A. Gautam (Work)",
            email: "agautam@vlsilabs.ai",
            role: "Workspace Owner",
            domain: "VLSI Labs Official",
            avatarColor: "bg-emerald-600",
        },
    ];

    const selectAccount = (name: string, email: string, role: string) => {
        setIsSigningIn(email);
        setTimeout(() => {
            saveUserSession({
                name,
                email,
                role,
                isGuest: false,
                provider: "google",
            });
            router.push(redirectUrl);
        }, 400);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customEmail.trim()) return;
        const displayName = customEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        selectAccount(displayName || "Google User", customEmail.trim(), "Member");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
                        <p className="text-xs text-slate-500">to continue to VLSI Labs Meetings</p>
                    </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Choose an account
                    </p>

                    <div className="space-y-2">
                        {presetGoogleAccounts.map((acc) => (
                            <button
                                key={acc.email}
                                type="button"
                                disabled={Boolean(isSigningIn)}
                                onClick={() => selectAccount(acc.name, acc.email, acc.role)}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${acc.avatarColor} text-white font-bold text-sm shadow-sm`}>
                                        {acc.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                                            {acc.name}
                                        </p>
                                        <p className="text-xs text-slate-500 font-mono">
                                            {acc.email}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition">
                                    {isSigningIn === acc.email ? "Signing in..." : "Select →"}
                                </span>
                            </button>
                        ))}
                    </div>

                    {!showCustomInput ? (
                        <button
                            type="button"
                            onClick={() => setShowCustomInput(true)}
                            className="mt-3 w-full py-2.5 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                        >
                            + Use another Google account
                        </button>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Enter Google Account email
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={customEmail}
                                    onChange={(e) => setCustomEmail(e.target.value)}
                                    placeholder="name@gmail.com"
                                    required
                                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="submit"
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-3 text-center">
                    <p className="text-[11px] text-slate-400">
                        Secure Google OAuth integration for instant team workspace collaboration.
                    </p>
                </div>
            </div>
        </div>
    );
}
