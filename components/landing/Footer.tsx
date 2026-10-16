import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
                <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/20">
                                V
                            </div>

                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    VLSI Labs
                                </p>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Meetings
                                </p>
                            </div>
                        </Link>

                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            High performance video collaboration built for engineering teams.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <a
                            href="#product"
                            className="transition hover:text-slate-900 dark:hover:text-white"
                        >
                            Product
                        </a>

                        <a
                            href="#features"
                            className="transition hover:text-slate-900 dark:hover:text-white"
                        >
                            Features
                        </a>

                        <a
                            href="#workflow"
                            className="transition hover:text-slate-900 dark:hover:text-white"
                        >
                            Workflow
                        </a>

                        <a
                            href="/login"
                            className="transition hover:text-slate-900 dark:hover:text-white"
                        >
                            Sign in
                        </a>

                        <a
                            href="/register"
                            className="transition hover:text-slate-900 dark:hover:text-white font-medium text-blue-600 dark:text-blue-400"
                        >
                            Create account
                        </a>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-6 text-sm text-slate-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 VLSI Labs. All rights reserved.</p>

                    <div className="flex gap-5">
                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">
                            Privacy Policy
                        </a>

                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">
                            Terms of Service
                        </a>

                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">
                            Support
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
