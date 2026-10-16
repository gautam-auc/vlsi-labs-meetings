import React from "react";

type StatsCardProps = {
    label: string;
    value: string;
    description: string;
    icon: React.ReactNode;
};

export default function StatsCard({
    label,
    value,
    description,
    icon,
}: StatsCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/80 text-sm font-bold text-blue-600 dark:text-blue-400">
                    {icon}
                </div>
            </div>
        </div>
    );
}