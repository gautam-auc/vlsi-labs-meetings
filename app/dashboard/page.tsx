import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatsCard from "../../components/dashboard/StatsCard";
import MeetingCard from "../../components/dashboard/MeetingCard";

const meetings = [
    {
        title: "Product Development",
        date: "Today",
        time: "03:00 PM",
        participants: ["AG", "RK", "PS", "JD"],
        status: "upcoming" as const,
    },
    {
        title: "Client Discussion",
        date: "Tomorrow",
        time: "11:30 AM",
        participants: ["AG", "PS", "MK"],
        status: "upcoming" as const,
    },
    {
        title: "Team Standup",
        date: "Friday",
        time: "10:00 AM",
        participants: ["AG", "RK", "PS", "JD", "MK"],
        status: "upcoming" as const,
    },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">

                        {/* Welcome */}
                        <section className="mb-8">
                            <p className="text-sm font-medium text-indigo-600">
                                VLSI Labs Workspace
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                Good morning, A. Gautam
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Here&apos;s what&apos;s happening with your meetings today.
                            </p>
                        </section>

                        {/* Stats */}
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                label="Today&apos;s meetings"
                                value="3"
                                description="2 upcoming"
                                icon="◷"
                            />

                            <StatsCard
                                label="Upcoming"
                                value="8"
                                description="This week"
                                icon="□"
                            />

                            <StatsCard
                                label="Team members"
                                value="24"
                                description="Active members"
                                icon="♙"
                            />

                            <StatsCard
                                label="Completed"
                                value="18"
                                description="This month"
                                icon="✓"
                            />
                        </section>

                        {/* Main content */}
                        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">

                            {/* Meetings */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Upcoming meetings
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Your team&apos;s scheduled meetings.
                                        </p>
                                    </div>

                                    <a
                                        href="/dashboard/meetings"
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        View all
                                    </a>
                                </div>

                                <div className="space-y-4">
                                    {meetings.map((meeting) => (
                                        <MeetingCard
                                            key={`${meeting.title}-${meeting.date}`}
                                            {...meeting}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Right panel */}
                            <aside className="space-y-6">

                                {/* Schedule */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        +
                                    </div>

                                    <h3 className="mt-5 font-bold text-slate-900">
                                        Schedule a meeting
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Create a meeting and share the link with your team.
                                    </p>

                                    <a
                                        href="/meetings/create"
                                        className="mt-5 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                        Create meeting
                                    </a>
                                </div>

                                {/* Quick Join */}
                                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                                    <p className="text-sm font-semibold text-indigo-400">
                                        Quick join
                                    </p>

                                    <h3 className="mt-2 text-lg font-bold">
                                        Have a meeting link?
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Enter a meeting code to join an existing meeting.
                                    </p>

                                    <div className="mt-5 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Meeting code"
                                            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                                        />

                                        <button
                                            type="button"
                                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>

                            </aside>
                        </section>

                        {/* Bottom information */}
                        <section className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-indigo-700">
                                        Keep your meetings productive
                                    </p>

                                    <p className="mt-1 text-sm text-indigo-600/80">
                                        Capture decisions and action items after every meeting.
                                    </p>
                                </div>

                                <a
                                    href="/dashboard/meetings"
                                    className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                                >
                                    View meeting history
                                </a>
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}