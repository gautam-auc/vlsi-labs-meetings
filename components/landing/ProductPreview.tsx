export default function ProductPreview() {
    return (
        <section id="product" className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid items-center gap-14 lg:grid-cols-2">
                    {/* Content */}
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                            One workspace
                        </p>

                        <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Everything around your meeting, in one place.
                        </h2>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                            Connect with your team, share ideas, and get work done—all in one place-VLSI Labs Meetings.
                        </p>

                        <div className="mt-8 space-y-4">
                            <FeaturePoint text="Create and schedule meetings" />
                            <FeaturePoint text="Share a simple meeting link" />
                            <FeaturePoint text="Keep meeting notes and action items" />
                        </div>
                    </div>

                    {/* Meeting preview */}
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-xl">
                        <div className="rounded-2xl bg-slate-950 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400">Live meeting</p>

                                    <p className="mt-1 text-sm font-semibold text-white">
                                        Product Discussion
                                    </p>
                                </div>

                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                    ● Live
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Participant initials="AG" />
                                <Participant initials="RK" />
                                <Participant initials="PS" />
                                <Participant initials="JD" />
                            </div>

                            <div className="mt-5 flex justify-center gap-3">
                                <MeetingButton label="🎤" />
                                <MeetingButton label="📹" />
                                <MeetingButton label="🖥" />
                                <MeetingButton label="💬" />

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm text-white">
                                    ↗
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
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                ✓
            </div>

            <span className="text-sm font-medium text-slate-700">{text}</span>
        </div>
    );
}

function Participant({ initials }: { initials: string }) {
    return (
        <div className="flex h-32 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-slate-400">
            {initials}
        </div>
    );
}

function MeetingButton({ label }: { label: string }) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm">
            {label}
        </div>
    );
}