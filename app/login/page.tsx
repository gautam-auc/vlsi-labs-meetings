import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* Left branding panel */}
                <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold">
                                V
                            </div>

                            <div>
                                <p className="font-bold">VLSI Labs</p>
                                <p className="text-xs text-slate-400">Meetings</p>
                            </div>
                        </Link>
                    </div>

                    <div className="max-w-lg">
                        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                            VLSI Labs Meetings
                        </p>

                        <h1 className="mt-5 text-5xl font-bold leading-tight">
                            Bring your team together.
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-400">
                            Schedule meetings, collaborate with your team and keep your
                            work moving from one focused workspace.
                        </p>
                    </div>

                    <p className="text-sm text-slate-500">
                        Internal collaboration platform
                    </p>
                </section>

                {/* Login panel */}
                <section className="flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="mb-10 lg:hidden">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                                    V
                                </div>

                                <div>
                                    <p className="font-bold text-slate-900">
                                        VLSI Labs
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Meetings
                                    </p>
                                </div>
                            </Link>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-indigo-600">
                                Welcome back
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                Sign in to your workspace
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Access your meetings, team and workspace.
                            </p>
                        </div>

                        {/* Form */}
                        <form className="mt-8 space-y-5">

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Work email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@vlsilabs.ai"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <a
                                        href="#"
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Forgot password?
                                    </a>
                                </div>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                            >
                                Sign in
                            </button>
                        </form>

                        {/* Register */}
                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <a
                                href="/register"
                                className="font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                Create account
                            </a>
                        </p>

                        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                            <Link
                                href="/"
                                className="text-sm font-medium text-slate-500 hover:text-slate-900"
                            >
                                ← Back to VLSI Labs Meetings
                            </Link>
                        </div>

                    </div>
                </section>
            </div>
        </main>
    );
}
