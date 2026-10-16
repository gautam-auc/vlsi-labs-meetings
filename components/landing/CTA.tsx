import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function CTA() {
    return (
        <section className="px-6 py-24 lg:px-8 bg-slate-50 border-t border-slate-200/60">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 text-center shadow-2xl sm:px-16 border border-slate-800">
                {/* Background ambient gradient glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/25 via-sky-500/10 to-transparent blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    {/* Company Logo Badge */}
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 shadow-md">
                        <Image
                            src="/logo.png"
                            alt="VLSI Labs"
                            width={20}
                            height={25}
                            className="h-5 w-auto object-contain"
                            referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-semibold tracking-wide text-slate-200">
                            VLSI Labs Meetings
                        </span>
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Bring your team together.
                        <br />
                        <span className="text-indigo-400">Keep the engineering work moving.</span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
                        Start organizing your team&apos;s meetings, conversations and follow-up
                        work in one place. No complex installation or account friction.
                    </p>

                    {/* CTAs */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:bg-slate-100 w-full sm:w-auto"
                        >
                            <span>Open Dashboard (Guest)</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 w-full sm:w-auto"
                        >
                            <span>Create account</span>
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span>Encrypted Peer-to-Peer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <span>Instant Sub-100ms Latency</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
