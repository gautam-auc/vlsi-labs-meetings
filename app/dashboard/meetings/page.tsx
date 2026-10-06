import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import MeetingCard from "../../../components/dashboard/MeetingCard";

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
    {
        title: "Weekly Planning",
        date: "Monday",
        time: "04:00 PM",
        participants: ["AG", "RK", "PS"],
        status: "upcoming" as const,
    },
];

export default function MeetingsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">

                        {/* Page heading */}
                        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-600">
                                    Workspace
                                </p>

                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    Meetings
                                </h1>

                                <p className="mt-2 text-sm text-slate-500">
                                    Manage your scheduled and previous meetings.
                                </p>
                            </div>

                            <a
                                href="/meetings/create"
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                            >
                                + Create meeting
                            </a>
                        </section>

                        {/* Filters */}
                        <section className="mt-8 flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                All meetings
                            </button>

                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Upcoming
                            </button>

                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Completed
                            </button>
                        </section>

                        {/* Meeting list */}
                        <section className="mt-6 space-y-4">
                            {meetings.map((meeting) => (
                                <MeetingCard
                                    key={`${meeting.title}-${meeting.date}`}
                                    title={meeting.title}
                                    date={meeting.date}
                                    time={meeting.time}
                                    participants={meeting.participants}
                                    status={meeting.status}
                                />
                            ))}
                        </section>

                        {/* Empty-state information */}
                        <section className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                            <p className="text-sm font-semibold text-indigo-700">
                                Manage your meetings
                            </p>

                            <p className="mt-1 text-sm text-indigo-600/80">
                                Create a meeting, generate a shareable link and invite your
                                team members.
                            </p>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}