export default function CTA() {
    return (
        <section className="bg-[var(--background)] px-6 py-24 lg:px-8 transition-colors duration-200 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-800 px-8 py-16 text-center shadow-2xl sm:px-16">
                {/* Background glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                        VLSI Labs Meetings
                    </p>

                    <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Bring your team together.
                        <br />
                        Keep the work moving.
                    </h2>

                    <p className="mx-auto mt-6 max-w-xl text-slate-300">
                        Start organizing your team&apos;s meetings, engineering discussions, and follow-up
                        work in one focused workspace.
                    </p>

                    <a
                        href="/register"
                        className="mt-9 inline-flex rounded-xl bg-blue-600 hover:bg-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
                    >
                        Get started free →
                    </a>
                </div>
            </div>
        </section>
    );
}
