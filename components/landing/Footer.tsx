import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
                <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                                V
                            </div>

                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    VLSI Labs
                                </p>

                                <p className="text-[11px] text-slate-500">
                                    Meetings
                                </p>
                            </div>
                        </Link>

                        <p className="mt-4 text-sm text-slate-500">
                            Meet. Collaborate. Work.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
                        <a
                            href="#product"
                            className="transition hover:text-slate-900"
                        >
                            Product
                        </a>

                        <a
                            href="#features"
                            className="transition hover:text-slate-900"
                        >
                            Features
                        </a>

                        <a
                            href="#workflow"
                            className="transition hover:text-slate-900"
                        >
                            Workflow
                        </a>

                        <a
                            href="/login"
                            className="transition hover:text-slate-900"
                        >
                            Sign in
                        </a>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 VLSI Labs. All rights reserved.</p>

                    <div className="flex gap-5">
                        <a href="#" className="hover:text-slate-700">
                            Privacy
                        </a>

                        <a href="#" className="hover:text-slate-700">
                            Terms
                        </a>

                        <a href="#" className="hover:text-slate-700">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
