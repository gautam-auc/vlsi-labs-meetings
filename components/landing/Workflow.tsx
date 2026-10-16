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
        <section id="workflow" className="scroll-mt-20 bg-[var(--background)] text-[var(--text)] py-24 transition-colors duration-200 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        From conversation to action
                    </p>

                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        Keep the work moving.
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                        A meeting should never be an isolated event—it connects planning directly into deliverables.
                    </p>
                </div>

                {/* Steps */}
                <div className="mt-16 grid gap-8 sm:grid-cols-5">
                    {steps.map((step) => (
                        <div key={step.number} className="relative text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-lg font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                                {step.number}
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                                {step.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Workflow visual */}
                <div className="mt-16 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 shadow-sm backdrop-blur-sm">
                    <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-5 md:flex-row">
                        <WorkflowCard title="Meeting" subtitle="Product Discussion" />
                        <Arrow />
                        <WorkflowCard title="Notes" subtitle="3 decisions captured" />
                        <Arrow />
                        <WorkflowCard title="Actions" subtitle="2 tasks assigned" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function WorkflowCard({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm md:w-56 transition hover:border-blue-400 dark:hover:border-blue-500">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
    );
}

function Arrow() {
    return (
        <div className="hidden text-xl font-semibold text-blue-500 dark:text-blue-400 md:block">
            →
        </div>
    );
}