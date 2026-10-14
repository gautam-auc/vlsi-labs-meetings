import Link from "next/link";

export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                        V
                    </div>

                    <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900">
                            VLSI Labs
                        </p>

                        <p className="text-[11px] font-medium text-slate-500">
                            Meetings
                        </p>
                    </div>
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    <a
                        href="#product"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
                    >
                        Product
                    </a>

                    <a
                        href="#features"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
                    >
                        Features
                    </a>

                    <a
                        href="#workflow"
                        className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
                    >
                        Workflow
                    </a>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <a
                        href="/login"
                        className="hidden text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:block"
                    >
                        Sign in
                    </a>

                    <a
                        href="/register"
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Get started
                    </a>
                </div>
            </div>
        </header>
    );
}
