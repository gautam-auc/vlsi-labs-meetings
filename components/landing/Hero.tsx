import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-slate-50 px-6 pb-20 pt-32 lg:px-8 lg:pb-28 lg:pt-40">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_70%_25%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_25%_15%,rgba(56,189,248,0.12),transparent_26%)]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Meetings built for focused teams
                    </div>

                    <h1 className="mt-6 text-5xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                        Meet with purpose.{" "}
                        <span className="text-indigo-600">Move work forward.</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                        A calmer workspace for planning, decisions, and follow-up. Start a
                        video meeting in seconds and keep every conversation connected to
                        the work that follows.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                            Create your workspace <span className="ml-2">→</span>
                        </Link>
                        <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                            Sign in
                        </Link>
                    </div>

                    <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
                        <div className="flex -space-x-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-indigo-100 text-[10px] font-bold text-indigo-700">AG</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-amber-100 text-[10px] font-bold text-amber-700">RK</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-emerald-100 text-[10px] font-bold text-emerald-700">PS</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-50 bg-rose-100 text-[10px] font-bold text-rose-700">JD</span>
                        </div>
                        Trusted by teams who value their time.
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-2xl">
                    <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-indigo-200/40 blur-3xl" />
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
                        <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 font-bold">V</span>
                                <div><p className="text-sm font-semibold">Product planning</p><p className="text-xs text-slate-400">Live now · 4 people</p></div>
                            </div>
                            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">● Live</span>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="relative aspect-[1.28] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 p-4"><div className="absolute inset-x-5 top-6 h-24 rounded-full bg-white/10 blur-2xl" /><div className="absolute bottom-4 left-4"><p className="text-sm font-semibold text-white">A. Gautam</p><p className="mt-1 text-xs text-indigo-100">You</p></div></div>
                            <div className="relative aspect-[1.28] overflow-hidden rounded-2xl bg-slate-100 p-4"><div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-200" /><div className="absolute bottom-4 left-4"><p className="text-sm font-semibold text-slate-800">Priya Shah</p><p className="mt-1 text-xs text-slate-500">Design</p></div></div>
                        </div>

                        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">Today&apos;s decisions</p><span className="text-xs font-medium text-indigo-600">3 captured</span></div>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-600 shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-500" />Ship the prototype on Friday</div>
                                <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-600 shadow-sm"><span className="h-2 w-2 rounded-full bg-indigo-500" />Assign accessibility review</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
