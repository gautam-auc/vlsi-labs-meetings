type MeetingCardProps = {
    title: string;
    date: string;
    time: string;
    participants: string[];
    status: "upcoming" | "live";
    id?: string;
};

export default function MeetingCard({
    title,
    date,
    time,
    participants,
    status,
    id,
}: MeetingCardProps) {
    const meetingRoomId = id || `VLSI-${title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Meeting information */}
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                        {title.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900">
                            {title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {date} · {time}
                        </p>

                        <div className="mt-3 flex items-center">
                            {participants.map((participant, index) => (
                                <div
                                    key={`${participant}-${index}`}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-600 ${index > 0 ? "-ml-2" : ""
                                        }`}
                                >
                                    {participant}
                                </div>
                            ))}

                            <span className="ml-2 text-xs text-slate-400">
                                {participants.length} participants
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status and action */}
                <div className="flex items-center gap-3">
                    {status === "live" ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                            ● Live
                        </span>
                    ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                            Scheduled
                        </span>
                    )}

                    <a
                        href={`/meet/${meetingRoomId}`}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                        {status === "live" ? "Join now" : "Join meeting"}
                    </a>
                </div>
            </div>
        </div>
    );
}