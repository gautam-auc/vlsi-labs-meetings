"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Video, Plus, ArrowRight } from "lucide-react";
import HeroLiveShowcase from "./HeroLiveShowcase";
import JoinMeetingModal from "./JoinMeetingModal";

export default function Hero() {
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    return (
        <section className="relative overflow-hidden bg-slate-50 px-6 pb-20 pt-28 transition-colors duration-200 dark:bg-slate-950 lg:px-8 lg:pb-28 lg:pt-36">
            {/* Background ambient lighting */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.20),transparent_35%),radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.14),transparent_30%)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.18),transparent_35%)]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
                {/* Left side: Company branding, headline, value bullets and CTAs */}
                <div className="max-w-2xl">
                    {/* Company Branding Kicker */}
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-white/95 px-3 py-1.5 shadow-xs backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/90">
                        <Image
                            src="/logo.png"
                            alt="VLSI Labs"
                            width={20}
                            height={26}
                            className="h-5 w-auto object-contain"
                            priority
                            referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200">
                            VLSI Labs Meetings · Engineering Workspace
                        </span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                        Everything around your meeting,{" "}
                        <span className="text-indigo-600 dark:text-indigo-400 block sm:inline">in one place.</span>
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                        Connect with your team, share ideas, and get work done—all in one
                        place with <strong className="font-semibold text-slate-900 dark:text-white">VLSI Labs Meetings</strong>.
                        Start a video meeting in seconds and keep every conversation connected to the work that follows.
                    </p>

                    {/* Value bullet points with crisp Lucide Check icons */}
                    <div className="mt-8 space-y-3.5">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Create and schedule meetings with instant 1-click links
                            </span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Seamless audio, video & screen sharing across laptop & phone
                            </span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Keep meeting notes, decisions and action items organized
                            </span>
                        </div>
                    </div>

                    {/* CTAs: Primary Create Meeting, Secondary Join Meeting (Per Spec Page 6) */}
                    <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Link
                            href="/meetings/create"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Meeting</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setJoinModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-xs transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Video className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Join Meeting</span>
                        </button>

                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                        >
                            <span>Dashboard as Guest</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Social proof */}
                    <div className="mt-9 flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex -space-x-2">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:border-slate-900">
                                AG
                            </span>
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-white bg-amber-100 text-[10px] font-bold text-amber-700 dark:border-slate-900">
                                RK
                            </span>
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:border-slate-900">
                                PS
                            </span>
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-white bg-rose-100 text-[10px] font-bold text-rose-700 dark:border-slate-900">
                                JD
                            </span>
                        </div>
                        Trusted by engineering teams for fast, reliable meetings.
                    </div>
                </div>

                {/* Right side: Modern Interactive Video Meeting Workspace Showcase */}
                <HeroLiveShowcase />
            </div>

            {/* Join Meeting Modal */}
            <JoinMeetingModal
                isOpen={joinModalOpen}
                onClose={() => setJoinModalOpen(false)}
            />
        </section>
    );
}
