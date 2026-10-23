export default function CTA() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/20 via-slate-50/70 to-slate-100/50 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 px-4 sm:px-6 py-14 sm:py-20 lg:py-24 transition-colors duration-200 border-t border-slate-200/80 dark:border-slate-800/70">
            {/* Ambient soft backlight */}
            <div className="pointer-events-none absolute left-1/2 -top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-400/10 dark:bg-cyan-500/10 blur-[120px]" />

            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-800 px-5 py-10 sm:px-12 sm:py-16 text-center shadow-2xl">
                {/* Background glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl animate-pulse-halo" />

                {/* Subtle tech grid inside card */}
                <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="relative">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-cyan-400">
                        VLSI Labs Meetings
                    </p>

                    <h2 className="mx-auto mt-4 sm:mt-5 max-w-3xl text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18]">
                        Bring your team together.
                        <br className="hidden xs:inline" />{" "}
                        Keep the work moving.
                    </h2>

                    <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-xs sm:text-base text-slate-300 leading-relaxed">
                        Start organizing your team&apos;s meetings, engineering discussions, and follow-up
                        work in one focused workspace.
                    </p>

                    <a
                        href="/register"
                        className="btn-interactive shimmer-sweep mt-7 sm:mt-9 inline-flex w-full xs:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-blue-600/40 transition hover:-translate-y-0.5"
                    >
                        <span>Get started free</span>
                        <span>→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
