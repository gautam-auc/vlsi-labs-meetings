import ThemeToggle from "../ThemeToggle";

export default function Header() {
    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-8 transition-colors duration-200">
            {/* Page information */}
            <div className="pl-12 lg:pl-0">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Workspace
                </p>

                <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    Dashboard
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Global Theme Toggle */}
                <ThemeToggle />

                {/* Notification */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
                </button>

                {/* User */}
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        AG
                    </span>

                    <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
                        A. Gautam
                    </span>
                </button>
            </div>
        </header>
    );
}