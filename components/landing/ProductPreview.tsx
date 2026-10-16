export default function ProductPreview() {
    return (
        <section id="product" className="scroll-mt-20 bg-[var(--background)] text-[var(--text)] py-24 transition-colors duration-200 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid items-center gap-14 lg:grid-cols-2">
                    {/* Content */}
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Unified Platform
                        </p>

                        <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                            Everything around your meeting, in one place.
                        </h2>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                            Connect with your team, share technical diagrams, and keep execution on schedule with VLSI Labs Meetings.
                        </p>

                        <div className="mt-8 space-y-4">
                            <FeaturePoint text="Create and schedule secure engineering sessions" />
                            <FeaturePoint text="Share instant, zero-install WebRTC meeting links" />
                            <FeaturePoint text="Retain action items and track meeting outcomes" />
                        </div>
                    </div>

                    {/* Meeting preview */}
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl">
                        <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Live meeting</p>

                                    <p className="mt-1 text-sm font-semibold text-white">
                                        Silicon Tapeout Sync · Architecture
                                    </p>
                                </div>

                                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                                    ● Live
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Participant initials="AG" label="Gautam (Host)" />
                                <Participant initials="RK" label="Rajesh (Physical Design)" />
                                <Participant initials="PS" label="Priya (Verification)" />
                                <Participant initials="JD" label="John (Synthesis)" />
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-3">
                                <MeetingButton label="🎤" />
                                <MeetingButton label="📹" />
                                <MeetingButton label="🖥" />
                                <MeetingButton label="💬" />

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-sm text-white shadow-md shadow-rose-600/30">
                                    ✕
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturePoint({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-xs font-bold text-blue-600 dark:text-blue-400">
                ✓
            </div>

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{text}</span>
        </div>
    );
}

function Participant({ initials, label }: { initials: string; label: string }) {
    return (
        <div className="relative flex h-28 flex-col items-center justify-center rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-xl font-bold text-slate-300">{initials}</span>
            <span className="absolute bottom-2 left-2 text-[10px] text-slate-400 truncate max-w-[85%]">{label}</span>
        </div>
    );
}

function MeetingButton({ label }: { label: string }) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/90 border border-slate-700 text-sm text-slate-200 transition hover:bg-slate-700">
            {label}
        </div>
    );
}