import { Zap, MonitorUp, ShieldCheck, CheckSquare, ArrowRight } from "lucide-react";

export default function Features() {
    const pillars = [
        {
            tag: "INFRASTRUCTURE",
            title: "Low-Latency Peer Mesh",
            description:
                "Decentralized WebRTC audio/video mesh with intelligent in-browser fallback. Direct peer streaming ensures sub-100ms latency without bottleneck servers.",
            badge: "Sub-100ms",
            icon: Zap,
            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        },
        {
            tag: "COLLABORATION",
            title: "Universal Screen & Slide Sharing",
            description:
                "Native OS display sharing on desktop, paired with hardware-accelerated presentation streaming on mobile browsers and secure iframe policies.",
            badge: "Multi-Device",
            icon: MonitorUp,
            color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        },
        {
            tag: "GOVERNANCE",
            title: "Multi-Admin & Database Control",
            description:
                "Centralized administrator dashboard with instant profile switching, MongoDB-compatible collection inspection, and full storage analytics.",
            badge: "Enterprise",
            icon: ShieldCheck,
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        },
        {
            tag: "PRODUCTIVITY",
            title: "Decision & Action Persistence",
            description:
                "Keep engineering meetings accountable. Capture timestamped decisions, participant logs, and synchronized workspace notes that persist across sessions.",
            badge: "Zero Friction",
            icon: CheckSquare,
            color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
        },
    ];

    return (
        <section id="features" className="bg-slate-50 py-24 border-t border-slate-200/70 transition-colors duration-200 dark:bg-slate-950 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Platform Capabilities
                    </p>

                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                        Engineered for silicon teams, researchers & high-velocity builders.
                    </h2>

                    <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                        VLSI Labs Meetings eliminates complex setup friction. Jump into instant audio/video rooms, share presentation decks across any device, and manage workspace data with complete administrative transparency.
                    </p>
                </div>

                {/* 4 Feature Pillars Grid */}
                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {pillars.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${feature.color}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
                                            {feature.badge}
                                        </span>
                                    </div>

                                    <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        {feature.tag}
                                    </p>

                                    <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                        {feature.description}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    <span>Learn more</span>
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}