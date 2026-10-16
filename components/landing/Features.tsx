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
        <section id="features" className="scroll-mt-20 bg-[var(--background)] text-[var(--text)] py-24 transition-colors duration-200 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Simple & Reliable
                    </p>

                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        Schedule. Meet. Ship.
                    </h2>

                    <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                        Everything your engineering team needs to collaborate in real-time without distracting bloat.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.number}
                            className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition duration-300 hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80">
                                    {feature.icon}
                                </span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                    {feature.number}
                                </span>
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                                {feature.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                {feature.description}
                            </p>

                            <div className="mt-6 h-1 w-8 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 group-hover:w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}