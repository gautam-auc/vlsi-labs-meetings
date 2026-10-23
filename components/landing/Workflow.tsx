const steps = [
    {
        number: "01",
        title: "Schedule",
        description: "Plan the meeting.",
    },
    {
        number: "02",
        title: "Share",
        description: "Send the meeting link.",
    },
    {
        number: "03",
        title: "Meet",
        description: "Connect with your team.",
    },
    {
        number: "04",
        title: "Capture",
        description: "Record notes and decisions.",
    },
    {
        number: "05",
        title: "Work",
        description: "Turn decisions into action.",
    },
];

export default function Workflow() {
    return (
        <section id="workflow" className="scroll-mt-20 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-blue-50/20 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 text-[var(--text)] py-14 sm:py-20 lg:py-24 transition-colors duration-200 border-t border-slate-200/80 dark:border-slate-800/70">
            {/* Ambient soft backlight */}
            <div className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-blue-400/8 dark:bg-cyan-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-indigo-400/8 dark:bg-indigo-500/10 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        From conversation to action
                    </p>

                    <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                        Keep the work moving.
                    </h2>

                    <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                        A meeting should never be an isolated event—it connects planning directly into deliverables.
                    </p>
                </div>

                {/* Steps with responsive grid and desktop connector */}
                <div className="relative mt-10 sm:mt-16 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3.5 sm:gap-6">
                    {/* Animated connecting line across steps (desktop only) */}
                    <div className="pointer-events-none absolute top-8 left-[10%] right-[10%] hidden sm:block h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-500/50 to-indigo-500/20 dark:from-cyan-500/20 dark:via-cyan-500/60 dark:to-indigo-500/20 -z-0">
                        <div className="h-full w-24 bg-gradient-to-r from-transparent via-blue-500 dark:via-cyan-400 to-transparent animate-shimmer" />
                    </div>

                    {steps.map((step) => (
                        <div key={step.number} className="group relative text-center z-10 cursor-pointer p-2 sm:p-0">
                            <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 text-base sm:text-lg font-bold text-blue-600 dark:text-cyan-400 border border-slate-200/90 dark:border-slate-800 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-blue-400 dark:group-hover:border-cyan-400 group-hover:shadow-blue-500/20 font-mono">
                                {step.number}
                            </div>

                            <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                                {step.title}
                            </h3>

                            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Workflow visual */}
                <div className="mt-10 sm:mt-16 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-8 shadow-sm backdrop-blur-sm">
                    <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:gap-5 md:flex-row">
                        <WorkflowCard
                            tag="Step 1"
                            title="Meeting"
                            subtitle="Product & EDA Review"
                            icon="💡"
                        />
                        <Arrow />
                        <WorkflowCard
                            tag="Step 2"
                            title="Notes"
                            subtitle="3 decisions captured"
                            icon="📝"
                        />
                        <Arrow />
                        <WorkflowCard
                            tag="Step 3"
                            title="Actions"
                            subtitle="2 tasks auto-assigned"
                            icon="🚀"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function WorkflowCard({
    tag,
    title,
    subtitle,
    icon,
}: {
    tag: string;
    title: string;
    subtitle: string;
    icon: string;
}) {
    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm md:w-60 transition-all duration-300 hover:border-blue-400 dark:hover:border-cyan-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-cyan-800/40">
                    {tag}
                </span>
                <span className="text-lg">{icon}</span>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
    );
}

function Arrow() {
    return (
        <div className="hidden text-xl font-bold text-blue-500 dark:text-cyan-400 md:block transition-transform duration-300 hover:translate-x-1">
            →
        </div>
    );
}