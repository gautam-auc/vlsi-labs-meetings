import Link from "next/link";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                        V
                    </div>

                    <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                            VLSI Labs
                        </p>

                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Meetings
                        </p>
                    </div>
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    <a
                        href="#product"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-slate-950 dark:hover:text-white"
                    >
                        Product
                    </a>

                    <a
                        href="#features"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-slate-950 dark:hover:text-white"
                    >
                        Features
                    </a>

                    <a
                        href="#workflow"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-slate-950 dark:hover:text-white"
                    >
                        Workflow
                    </a>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle Button */}
                    <ThemeToggle />

                    <a
                        href="/login"
                        className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:text-slate-950 dark:hover:text-white sm:block"
                    >
                        Sign in
                    </a>

                    <a
                        href="/register"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                    >
                        Get started
                    </a>
                </div>
            </div>
        </header>
    );
}
