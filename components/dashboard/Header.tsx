export default function Header() {
    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
            {/* Page information */}
            <div className="pl-12 lg:pl-0">
                <p className="text-xs font-medium text-slate-400">
                    Workspace
                </p>

                <h1 className="mt-1 text-lg font-bold text-slate-900">
                    Dashboard
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Notification */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                    ♢

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600" />
                </button>

                {/* User */}
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                        AG
                    </span>

                    <span className="hidden text-sm font-medium text-slate-700 sm:block">
                        A. Gautam
                    </span>
                </button>
            </div>
        </header>
    );
}