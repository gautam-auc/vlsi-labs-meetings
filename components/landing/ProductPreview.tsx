export default function ProductPreview() {
    return (
        <section id="product" className="relative overflow-hidden scroll-mt-20 bg-gradient-to-b from-white via-slate-50/75 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 text-[var(--text)] py-14 sm:py-20 lg:py-24 transition-colors duration-200 border-t border-slate-200/80 dark:border-slate-800/70">
            {/* Ambient soft backlight glows */}
            <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-blue-500/8 dark:bg-cyan-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                    {/* Content */}
                    <div>
                        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Unified Platform
                        </p>

                        <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                            Everything around your meeting, in one place.
                        </h2>

                        <p className="mt-4 sm:mt-6 max-w-xl text-sm sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                            Connect with your team, share technical diagrams, and keep execution on schedule with VLSI Labs Meetings.
                        </p>

                        <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                            <FeaturePoint text="Create and schedule secure engineering sessions" />
                            <FeaturePoint text="Share instant, zero-install WebRTC meeting links" />
                            <FeaturePoint text="Retain action items and track meeting outcomes" />
                        </div>
                    </div>

                    {/* Meeting preview */}
                    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 sm:p-5 shadow-xl sm:shadow-2xl backdrop-blur-sm transition hover:shadow-blue-500/10">
                        <div className="rounded-xl sm:rounded-2xl bg-slate-950 p-3.5 sm:p-6 border border-slate-800 relative overflow-hidden">
                            {/* Subtle background circuit trace */}
                            <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                            <div className="relative flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-slate-400 font-medium">Live CAD Session</p>
                                        <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 shrink-0">
                                            Low Latency • HD
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs sm:text-sm font-semibold text-white flex items-center gap-2 truncate">
                                        Silicon Tapeout Sync · Architecture
                                    </p>
                                </div>

                                <div className="relative flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 sm:px-3 py-1 text-xs font-semibold text-emerald-400 shrink-0">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                    </span>
                                    <span>Live</span>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 relative">
                                <Participant
                                    initials="AG"
                                    label="Gautam (Host)"
                                    isSpeaking={true}
                                />
                                <Participant
                                    initials="RK"
                                    label="Rajesh (Physical Design)"
                                    role="EDA Lead"
                                />
                                <Participant
                                    initials="PS"
                                    label="Priya (Verification)"
                                    role="Timing / STA"
                                />
                                <Participant
                                    initials="JD"
                                    label="John (Synthesis)"
                                    role="DFT / RTL"
                                />
                            </div>

                            <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 relative">
                                <MeetingButton label="🎤" title="Mute/Unmute Mic" active />
                                <MeetingButton label="📹" title="Camera" active />
                                <MeetingButton label="🖥" title="Share CAD Screen" active highlight />
                                <MeetingButton label="💬" title="Chat" />

                                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-rose-600 text-sm text-white shadow-md shadow-rose-600/30 transition hover:bg-rose-500 cursor-pointer">
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

function Participant({
    initials,
    label,
    role,
    isSpeaking = false
}: {
    initials: string;
    label: string;
    role?: string;
    isSpeaking?: boolean;
}) {
    return (
        <div className={`relative flex h-28 flex-col items-center justify-center rounded-xl bg-slate-900/90 border transition-all duration-300 ${
            isSpeaking
                ? "border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                : "border-slate-800 hover:border-slate-700"
        } text-center`}>
            {/* Animated Equalizer Waveform for Active Speaker */}
            {isSpeaking && (
                <div className="absolute top-2.5 right-2.5 flex items-end gap-1 h-5 px-1.5 py-1 rounded bg-slate-950/80 border border-emerald-500/30">
                    <span className="w-1 bg-emerald-400 rounded-full equalizer-1" />
                    <span className="w-1 bg-emerald-400 rounded-full equalizer-2" />
                    <span className="w-1 bg-emerald-400 rounded-full equalizer-3" />
                    <span className="w-1 bg-emerald-400 rounded-full equalizer-4" />
                </div>
            )}

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-inner">
                <span className="text-base font-bold text-slate-200">{initials}</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-left">
                <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[65%]">{label}</span>
                {role && (
                    <span className="text-[9px] text-slate-500 truncate">{role}</span>
                )}
            </div>
        </div>
    );
}

function MeetingButton({
    label,
    title,
    active = false,
    highlight = false
}: {
    label: string;
    title?: string;
    active?: boolean;
    highlight?: boolean;
}) {
    return (
        <div
            title={title}
            className={`btn-interactive flex h-10 w-10 items-center justify-center rounded-full border text-sm transition cursor-pointer ${
                highlight
                    ? "bg-blue-600/30 border-blue-500/50 text-blue-300 shadow-md shadow-blue-500/20"
                    : active
                    ? "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
        >
            {label}
        </div>
    );
}