type StatsCardProps = {
    label: string;
    value: string;
    description: string;
    icon: string;
};

export default function StatsCard({
    label,
    value,
    description,
    icon,
}: StatsCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm text-indigo-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}