export default function CTA() {
    return (
        <section className="px-6 py-24 lg:px-8">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 text-center shadow-2xl sm:px-16">
                {/* Background glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

                <div className="relative">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                        VLSI Labs Meetings
                    </p>

                    <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Bring your team together.
                        <br />
                        Keep the work moving.
                    </h2>

                    <p className="mx-auto mt-6 max-w-xl text-slate-400">
                        Start organizing your team's meetings, conversations and follow-up
                        work in one place.
                    </p>

                    <a
                        href="/register"
                        className="mt-9 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                        Get started →
                    </a>
                </div>
            </div>
        </section>
    );
}