import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Calendar, Video, Clock } from "lucide-react";

export default function ProductPreview() {
    return (
        <section id="product" className="border-t border-slate-200/60 bg-white py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Workspace Deep Dive
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                        Designed for high-velocity engineering discussions.
                    </h2>
                    <p className="mt-4 text-base text-slate-600 sm:text-lg">
                        VLSI Labs Meetings brings together instant video signaling, responsive screen sharing, and persistent workspace meeting history.
                    </p>
                </div>

                {/* Dashboard Showcase Card */}
                <div className="mt-14 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
                    {/* Browser bar with Company Logo */}
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1 border border-slate-800 text-xs">
                                <Image
                                    src="/logo.png"
                                    alt="VLSI Labs"
                                    width={16}
                                    height={20}
                                    className="h-4 w-auto object-contain"
                                    referrerPolicy="no-referrer"
                                />
                                <span className="font-mono text-slate-300">
                                    vlsilabs.ai/dashboard
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-xs"
                        >
                            <span>Open Live App</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Preview Dashboard Content */}
                    <div className="p-6 sm:p-8 grid gap-6 lg:grid-cols-3 bg-slate-900 text-white">
                        {/* Column 1: Today's Meetings */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Upcoming Today
                                </span>
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] text-indigo-300 font-medium">
                                    3 scheduled
                                </span>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-white">
                                            Product Development
                                        </p>
                                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            03:00 PM
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        4 participants · Architecture Review
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-white">
                                            Silicon Verification Standup
                                        </p>
                                        <span className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            04:30 PM
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        5 participants · Daily Sync
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Quick Meeting Join & Code */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Video className="h-3.5 w-3.5" />
                                    Instant Room Access
                                </span>
                                <h4 className="mt-2.5 text-base font-bold text-white">
                                    Zero software installation
                                </h4>
                                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                                    Share a simple meeting code with colleagues or join any room from laptop or mobile with one tap.
                                </p>
                            </div>

                            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-3.5 flex items-center justify-between">
                                <span className="font-mono text-xs text-indigo-300 font-semibold">
                                    VLSI-STANDUP
                                </span>
                                <Link
                                    href="/meet/VLSI-STANDUP"
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-xs"
                                >
                                    Quick Join
                                </Link>
                            </div>
                        </div>

                        {/* Column 3: Decision Tracking */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Decision Capture
                            </span>
                            <div className="mt-4 space-y-2.5">
                                <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 text-xs text-slate-300">
                                    <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                                    <span>Verified real-time screen share on desktop & mobile mesh</span>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 text-xs text-slate-300">
                                    <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                                    <span>Guest authentication enabled for direct demo exploration</span>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 text-xs text-slate-300">
                                    <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                                    <span>Saved meetings synchronized locally without account friction</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}