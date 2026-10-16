"use client";

import { useUserSession } from "../../lib/session";

export default function DashboardGreeting() {
    const user = useUserSession();

    return (
        <section className="mb-8">
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-indigo-600">
                    VLSI Labs Workspace
                </p>
                {user.isGuest && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                        Guest Mode
                    </span>
                )}
            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Welcome, {user.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
                {user.isGuest
                    ? "You are exploring as a guest user. Create, schedule, or join meetings instantly."
                    : "Here's what's happening with your meetings today."}
            </p>
        </section>
    );
}
