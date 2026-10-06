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
        <section id="workflow" className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        From conversation to action
                    </p>

                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                        Keep the work moving.
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                        A meeting should not end when everyone leaves the call.
                    </p>
                </div>

                {/* Steps */}
                <div className="mt-16 grid gap-8 sm:grid-cols-5">
                    {steps.map((step) => (
                        <div key={step.number} className="relative text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-600">
                                {step.number}
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                {step.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Workflow visual */}
                <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8">
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
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:w-56">
            <p className="text-sm font-bold text-slate-900">{title}</p>

            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
    );
}

function Arrow() {
    return (
        <div className="hidden text-xl font-semibold text-indigo-500 md:block">
            →
        </div>
    );
}