import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../theme/ThemeToggle";

export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="VLSI Labs"
                        width={36}
                        height={44}
                        className="h-9 w-auto object-contain"
                        priority
                        referrerPolicy="no-referrer"
                    />

                    <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
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
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                    >
                        Product
                    </a>

                    <a
                        href="#features"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                    >
                        Features
                    </a>

                    <a
                        href="#workflow"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                    >
                        Workflow
                    </a>

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        Dashboard
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    <Link
                        href="/dashboard"
                        className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 sm:px-3.5 sm:py-2 sm:text-sm"
                    >
                        Guest Access
                    </Link>

                    <Link
                        href="/login"
                        className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white sm:block"
                    >
                        Sign in
                    </Link>

                    <Link
                        href="/register"
                        className="rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                        Get started
                    </Link>
                </div>
            </div>
        </header>
    );
}
