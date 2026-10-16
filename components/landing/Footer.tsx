import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
                <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 group">
                            <Image
                                src="/logo.png"
                                alt="VLSI Labs"
                                width={36}
                                height={44}
                                className="h-9 w-auto object-contain transition group-hover:scale-105"
                                referrerPolicy="no-referrer"
                            />

                            <div className="leading-tight">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                    VLSI Labs
                                </p>

                                <p className="text-[11px] font-medium text-slate-500">
                                    Meetings
                                </p>
                            </div>
                        </Link>

                        <p className="mt-4 text-sm text-slate-500">
                            Meet. Collaborate. Work. High performance engineering communications.
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
                    <p>© {new Date().getFullYear()} VLSI Labs Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-slate-400">
                        <span>Zero Telemetry</span>
                        <span>·</span>
                        <span>Encrypted Mesh</span>
                        <span>·</span>
                        <span>MongoDB Persistence</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
