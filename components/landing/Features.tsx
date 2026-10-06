const features = [
    {
        number: "01",
        title: "Schedule",
        description:
            "Plan meetings, set the time and invite the right people before the conversation starts.",
    },
    {
        number: "02",
        title: "Meet",
        description:
            "Share a simple link and bring your team into a focused meeting room.",
    },
    {
        number: "03",
        title: "Work",
        description:
            "Capture notes, action items and follow-up tasks so meetings lead to real work.",
    },
];

export default function Features() {
    return (
        <section id="features" className="bg-slate-50 py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        Simple by design
                    </p>

                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                        Schedule. Meet. Work.
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Everything your team needs to keep meetings organized without
                        unnecessary complexity.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-14 grid gap-5 md:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.number}
                            className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5"
                        >
                            <span className="text-sm font-bold text-indigo-600">
                                {feature.number}
                            </span>

                            <h3 className="mt-8 text-xl font-bold text-slate-950">
                                {feature.title}
                            </h3>

                            <p className="mt-3 leading-7 text-slate-600">
                                {feature.description}
                            </p>

                            <div className="mt-7 h-1 w-8 rounded-full bg-indigo-600 transition-all duration-300 group-hover:w-14" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}