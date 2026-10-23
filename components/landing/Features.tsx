const features = [
    {
        number: "01",
        title: "Schedule & Invite",
        description:
            "Plan meetings, generate custom join links, and notify teammates seamlessly beforehand.",
        icon: (
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        number: "02",
        title: "Ultra-Low Latency Meet",
        description:
            "Crystal clear WebRTC video, synchronized signaling, screen sharing, and reliable audio channels.",
        icon: (
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        number: "03",
        title: "Decide & Follow-Up",
        description:
            "Record takeaways, share chat attachments, and keep technical discussions documented.",
        icon: (
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

export default function Features() {
    return (
        <section id="features" className="scroll-mt-20 relative overflow-hidden bg-gradient-to-b from-slate-100/60 via-slate-50/80 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 text-[var(--text)] py-14 sm:py-20 lg:py-24 transition-colors duration-200 border-t border-slate-200/80 dark:border-slate-800/70">
            {/* Subtle silicon tech matrix */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />
            {/* Ambient soft glow */}
            <div className="pointer-events-none absolute left-1/2 -top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-400/10 dark:bg-cyan-500/10 blur-[110px]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="max-w-2xl">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Simple & Reliable
                    </p>

                    <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                        Schedule. Meet. Ship.
                    </h2>

                    <p className="mt-3 sm:mt-4 text-sm sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                        Everything your engineering team needs to collaborate in real-time without distracting bloat.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.number}
                            className="group relative rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400 dark:hover:border-cyan-500/60 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer overflow-hidden backdrop-blur-sm"
                        >
                            {/* Subtle hover gradient sweep in background */}
                            <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative flex items-center justify-between">
                                <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 transition-transform duration-300 group-hover:scale-110">
                                    {feature.icon}
                                </span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                    {feature.number}
                                </span>
                            </div>

                            <h3 className="relative mt-5 sm:mt-6 text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                                {feature.title}
                            </h3>

                            <p className="relative mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {feature.description}
                            </p>

                            <div className="relative mt-5 sm:mt-6 h-1 w-8 rounded-full bg-blue-600 dark:bg-cyan-500 transition-all duration-300 group-hover:w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}