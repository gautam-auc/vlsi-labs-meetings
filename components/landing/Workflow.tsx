export default function Workflow() {
    const pipelineSteps = [
        {
            stage: "Phase 1",
            title: "Instant Room Provisioning",
            subtitle: "1-Click Generation",
            description: "Spawn high-entropy meeting IDs or join with corporate vanity codes without installing client software.",
            chip: "Zero Setup",
        },
        {
            stage: "Phase 2",
            title: "Multi-Peer Synchronization",
            subtitle: "Sub-100ms WebRTC Mesh",
            description: "Direct audio, video, and active-speaker multiplexing across distributed engineering team members.",
            chip: "Adaptive Bitrate",
        },
        {
            stage: "Phase 3",
            title: "Dynamic Presentation Sharing",
            subtitle: "Screen & Slide Decks",
            description: "Stream native desktop displays or animated interactive slide decks on mobile browsers seamlessly.",
            chip: "Hardware Accel",
        },
        {
            stage: "Phase 4",
            title: "Database Archival & Audit",
            subtitle: "Storage & Admin Console",
            description: "Logged meeting durations, participant rosters, and captured action items commit directly to storage.",
            chip: "Audit Ready",
        },
    ];

    return (
        <section id="workflow" className="bg-white py-24 border-t border-slate-200/60">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Lifecycle Pipeline
                    </p>

                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                        How VLSI Labs Meetings connects conversations to results.
                    </h2>

                    <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                        From link dispatch to post-meeting database storage, every interaction follows a clear, auditable pipeline.
                    </p>
                </div>

                {/* Pipeline visual cards */}
                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {pipelineSteps.map((step, idx) => (
                        <div
                            key={step.stage}
                            className="relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm hover:border-indigo-300 hover:bg-white transition"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                                        0{idx + 1}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                                        {step.chip}
                                    </span>
                                </div>

                                <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {step.stage}
                                </p>

                                <h3 className="mt-1 text-base font-bold text-slate-900">
                                    {step.title}
                                </h3>

                                <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                                    {step.subtitle}
                                </p>

                                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                    {step.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
                                <span>Stage {idx + 1} of 4</span>
                                <span className="text-indigo-600 font-bold">● Active</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Architecture Pipeline diagram */}
                <div className="mt-12 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="max-w-md">
                            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                                Enterprise Backbone
                            </span>
                            <h4 className="mt-3 text-xl font-bold">
                                Integrated Real-Time Mesh & Storage
                            </h4>
                            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                                Seamlessly switches between live signaling servers, browser channels, and MongoDB database models for full operational reliability.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-3 text-center">
                                <p className="text-[10px] text-slate-400">WebRTC Audio/Video</p>
                                <p className="text-sm font-bold text-emerald-400">100% Peer Mesh</p>
                            </div>
                            <span className="text-indigo-400 font-bold">→</span>
                            <div className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-3 text-center">
                                <p className="text-[10px] text-slate-400">Screen & Decks</p>
                                <p className="text-sm font-bold text-indigo-300">Dual-Stream Engine</p>
                            </div>
                            <span className="text-indigo-400 font-bold">→</span>
                            <div className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-3 text-center">
                                <p className="text-[10px] text-slate-400">Database Collections</p>
                                <p className="text-sm font-bold text-amber-300">Admin Inspector</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}