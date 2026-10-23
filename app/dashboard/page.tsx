"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import MeetingCard from "../../components/dashboard/MeetingCard";

interface MeetingItem {
    title: string;
    date: string;
    time: string;
    participants: string[];
    status: "upcoming" | "live" | "completed";
    meetingId: string;
    role?: string;
    tag?: string;
}

const defaultWeeklySlots = [
    { day: "Sun", date: "18", hasMeeting: false },
    { day: "Mon", date: "19", hasMeeting: true, color: "bg-emerald-500", label: "EDA Review" },
    { day: "Tue", date: "20", hasMeeting: true, color: "bg-purple-500", label: "STA Timing" },
    { day: "Wed", date: "21", hasMeeting: true, color: "bg-cyan-500", label: "CAD Stream" },
    { day: "Thu", date: "22", hasMeeting: true, color: "bg-pink-500", label: "Physical Design", isToday: true },
    { day: "Fri", date: "23", hasMeeting: true, color: "bg-indigo-500", label: "Tapeout Sync" },
    { day: "Sat", date: "24", hasMeeting: false },
];

export default function DashboardPage() {
    const router = useRouter();
    const [meetings, setMeetings] = useState<MeetingItem[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [joinError, setJoinError] = useState("");
    const [userName, setUserName] = useState("A. Gautam");
    const [greeting, setGreeting] = useState("Good morning");

    // Dynamic Live Greeting based on local hour
    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting("Good morning");
            } else if (hour >= 12 && hour < 17) {
                setGreeting("Good afternoon");
            } else {
                setGreeting("Good evening");
            }
        };
        updateGreeting();
        const timer = setInterval(updateGreeting, 60000);
        return () => clearInterval(timer);
    }, []);

    // Live Clock State
    const [currentTime, setCurrentTime] = useState("");
    const [timeZone, setTimeZone] = useState("GMT+5:30");
    const [analogSeconds, setAnalogSeconds] = useState(0);
    const [analogMinutes, setAnalogMinutes] = useState(0);
    const [analogHours, setAnalogHours] = useState(0);

    // Interactive Action Checklist
    const [tasks, setTasks] = useState([
        { id: 1, text: "Verify GDSII tapeout timing constraints", done: true },
        { id: 2, text: "Review Cadence / Synopsys EDA reports", done: true },
        { id: 3, text: "Run DRC/LVS physical verification check", done: false },
        { id: 4, text: "Share live WebRTC stream link with team", done: true },
    ]);

    // Live clock ticker
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            // Format "03:45 pm"
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const ampm = hours >= 12 ? "pm" : "am";
            hours = hours % 12;
            hours = hours ? hours : 12;
            const strTime = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
            setCurrentTime(strTime);

            // Analog angles
            setAnalogSeconds((seconds / 60) * 360);
            setAnalogMinutes(((minutes + seconds / 60) / 60) * 360);
            setAnalogHours((((now.getHours() % 12) + minutes / 60) / 12) * 360);

            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                setTimeZone(tz.replace(/_/g, " "));
            } catch {
                setTimeZone("Local Time");
            }
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Load user & meetings
    useEffect(() => {
        const storedName = localStorage.getItem("vlsilabs_user_name");
        if (storedName) setUserName(storedName);

        async function load() {
            try {
                const res = await fetch("/api/meetings");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.meetings) && data.meetings.length > 0) {
                        const formatted = data.meetings.map((m: any) => ({
                            title: m.title || "Engineering Sync",
                            date: m.date || "Today",
                            time: m.time || "03:00 PM",
                            participants: Array.isArray(m.participants) && m.participants.length > 0 ? m.participants : ["Gautam", "Lead", "Dev"],
                            status: (m.status || "upcoming") as "upcoming" | "live" | "completed",
                            meetingId: m.meetingId || m.id || "session",
                            tag: m.tag || "Silicon Sync",
                        }));
                        setMeetings(formatted);
                        setSelectedMeetingId(formatted[0].meetingId);
                        return;
                    }
                }
            } catch {}

            try {
                const saved = localStorage.getItem("vlsilabs_meetings");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const formatted = parsed.map((m: any) => ({
                            title: m.title || "Physical Design Sync",
                            date: m.date || "Scheduled",
                            time: m.time || "04:30 PM",
                            participants: m.participants ? (typeof m.participants === "string" ? m.participants.split(",").map((p: string) => p.trim()) : m.participants) : ["Gautam", "Arch Lead"],
                            status: "upcoming" as const,
                            meetingId: m.id || m.meetingId || "session",
                            tag: "EDA Review",
                        }));
                        setMeetings(formatted);
                        setSelectedMeetingId(formatted[0].meetingId);
                        return;
                    }
                }
            } catch {}

            // Default demo meetings matching Behance design
            const defaults: MeetingItem[] = [
                {
                    title: "Silicon Tapeout Sync · Architecture",
                    date: "Today",
                    time: "02:30 PM",
                    participants: ["AG", "Rajesh", "Priya", "John"],
                    status: "live",
                    meetingId: "vlsi-tapeout-sync",
                    tag: "4K CAD Stream",
                },
                {
                    title: "STA Timing & DRC Signoff",
                    date: "Today",
                    time: "04:00 PM",
                    participants: ["AG", "Chen", "Anita"],
                    status: "upcoming",
                    meetingId: "vlsi-sta-timing",
                    tag: "Physical Design",
                },
                {
                    title: "RTL Verification & DFT Sprint",
                    date: "Tomorrow",
                    time: "10:30 AM",
                    participants: ["AG", "Vikram", "Elena"],
                    status: "upcoming",
                    meetingId: "vlsi-rtl-dft",
                    tag: "Verification",
                },
            ];
            setMeetings(defaults);
            setSelectedMeetingId(defaults[0].meetingId);
        }
        load();
    }, []);

    // Instant Room Generation
    const handleInstantMeeting = () => {
        const randomCode = `vlsi-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 6)}`;
        router.push(`/meet/${randomCode}`);
    };

    // Quick Join Form
    const handleQuickJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const code = joinCode.trim();
        if (!code) {
            setJoinError("Please enter a meeting code or ID");
            return;
        }
        const cleanId = code.includes("/meet/") ? code.split("/meet/")[1].split("?")[0] : code;
        router.push(`/meet/${encodeURIComponent(cleanId)}`);
    };

    // Delete meeting
    const handleDeleteMeeting = async (id: string) => {
        setMeetings((prev) => prev.filter((m) => m.meetingId !== id));
        if (selectedMeetingId === id) {
            const remaining = meetings.filter((m) => m.meetingId !== id);
            setSelectedMeetingId(remaining[0]?.meetingId || null);
        }
        try {
            await fetch(`/api/meetings?id=${id}`, { method: "DELETE" });
        } catch {}
    };

    // Filtered meetings by search
    const filteredMeetings = useMemo(() => {
        if (!searchQuery.trim()) return meetings;
        const q = searchQuery.toLowerCase().trim();
        return meetings.filter(
            (m) =>
                m.title.toLowerCase().includes(q) ||
                m.meetingId.toLowerCase().includes(q) ||
                m.participants.some((p) => p.toLowerCase().includes(q))
        );
    }, [meetings, searchQuery]);

    // Active spotlighted meeting for right panel
    const activeMeeting = useMemo(() => {
        return meetings.find((m) => m.meetingId === selectedMeetingId) || meetings[0] || null;
    }, [meetings, selectedMeetingId]);

    const completedTasksCount = tasks.filter((t) => t.done).length;
    const taskPercent = Math.round((completedTasksCount / tasks.length) * 100);

    return (
        <div className="min-h-screen bg-[#f8f5fd] dark:bg-[#090b14] text-slate-800 dark:text-slate-100 transition-colors duration-200">
            {/* Behance Style Left Curved Floating Navigation Rail */}
            <Sidebar />

            {/* Main Dashboard Canvas Container */}
            <div className="lg:pl-28 px-4 sm:px-6 py-4 sm:py-6 max-w-[1700px] mx-auto pb-24 lg:pb-8">
                {/* Header (Dynamic Date + Capsule Search + User Badge) */}
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                {/* ROW 1: Hero Greeting Banner + Time Clock Widget */}
                <div className="grid gap-5 lg:grid-cols-[1.75fr_1fr] items-stretch mb-6">
                    {/* Hero Greeting Card (Lily Huynh Gradient Banner) */}
                    <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#db2777] p-6 sm:p-8 text-white shadow-xl shadow-purple-900/15 flex flex-col justify-between min-h-[220px]">
                        {/* Ambient Glass Rings & Circuit Overlay */}
                        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                        <div className="pointer-events-none absolute left-1/3 -bottom-16 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
                        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

                        <div className="relative z-10 max-w-md">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white mb-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                VLSI Labs Real-Time Workspace
                            </span>

                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                {greeting}, {userName}
                            </h1>

                            <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed max-w-sm">
                                Let&apos;s plan your upcoming engineering sessions, silicon tapeouts, and CAD reviews!
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleInstantMeeting}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-[#6d28d9] shadow-lg shadow-purple-950/20 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
                                >
                                    <span>Plan now</span>
                                    <span>→</span>
                                </button>

                                <span className="text-[11px] font-medium text-purple-200">
                                    {meetings.length} sessions queued
                                </span>
                            </div>
                        </div>

                        {/* 3D Silicon Collaboration Visual on Right */}
                        <div className="hidden sm:flex absolute right-4 bottom-2 top-2 items-center justify-center pointer-events-none w-56">
                            <div className="relative flex flex-col items-center">
                                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-2xl p-4">
                                    <img
                                        src="/logo.png"
                                        alt="VLSI Labs"
                                        className="h-16 w-16 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-pulse"
                                    />
                                </div>
                                <span className="mt-2 text-[10px] font-mono tracking-wider text-purple-200 uppercase bg-white/10 px-2 py-0.5 rounded-full">
                                    60 FPS • WebRTC
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Clock & Timezone Widget (Analog Dial + Digital Time) */}
                    <div className="relative overflow-hidden rounded-[2.2rem] border border-purple-100/90 dark:border-purple-900/40 bg-white/95 dark:bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="flex items-center justify-between w-full mb-3 text-left">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                                Global Timezone
                            </p>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        {/* Minimalist Analog Clock Dial (Lily Huynh Behance Style) */}
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-pink-50 to-purple-50 dark:from-purple-950/40 dark:to-pink-950/30 border-4 border-pink-300 dark:border-pink-500/50 shadow-inner my-1">
                            {/* Center Point */}
                            <div className="absolute h-2 w-2 rounded-full bg-[#6d28d9] dark:bg-pink-400 z-10" />

                            {/* Hour Hand */}
                            <div
                                className="absolute w-1 bg-slate-800 dark:text-white rounded-full origin-bottom"
                                style={{
                                    height: "22px",
                                    bottom: "48%",
                                    transform: `rotate(${analogHours}deg)`,
                                    transition: "transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                                }}
                            />

                            {/* Minute Hand */}
                            <div
                                className="absolute w-0.5 bg-[#6d28d9] dark:bg-purple-300 rounded-full origin-bottom"
                                style={{
                                    height: "30px",
                                    bottom: "48%",
                                    transform: `rotate(${analogMinutes}deg)`,
                                    transition: "transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                                }}
                            />

                            {/* Second Hand */}
                            <div
                                className="absolute w-[1px] bg-pink-500 rounded-full origin-bottom"
                                style={{
                                    height: "34px",
                                    bottom: "48%",
                                    transform: `rotate(${analogSeconds}deg)`,
                                    transition: "transform 0.2s linear",
                                }}
                            />
                        </div>

                        {/* Digital Time & Location */}
                        <div className="mt-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {currentTime || "03:00 pm"}
                            </h2>
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                                {timeZone}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">
                                Ready for synchronous EDA reviews
                            </p>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Capsule Quick Join Bar */}
                <div className="rounded-2xl sm:rounded-3xl border border-purple-100/90 dark:border-purple-900/40 bg-white/90 dark:bg-slate-900/90 p-3 sm:p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 shrink-0">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                                Quick Join Session
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Enter a meeting code or paste invite URL
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleQuickJoin} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => {
                                setJoinCode(e.target.value);
                                if (joinError) setJoinError("");
                            }}
                            placeholder="e.g. vlsi-tapeout-sync"
                            className="flex-1 rounded-full border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-slate-950/60 px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-[#6d28d9] hover:bg-[#5b21b6] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                        >
                            Join
                        </button>
                    </form>
                    {joinError && <p className="text-xs text-rose-500">{joinError}</p>}
                </div>

                {/* ROW 3: Lower Main Hub (Left: Weekly Gantt Timeline & Meetings List / Right: Meeting Overview Spotlight & Tasks) */}
                <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr] items-start">
                    {/* LEFT COLUMN: Weekly Timeline & Today's Meetings */}
                    <div className="space-y-6">
                        {/* Weekly Timeline Gantt View (Behance Scheduler Style) */}
                        <div className="rounded-[2.2rem] border border-purple-100/90 dark:border-purple-900/40 bg-white/95 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                        Weekly Overview
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Engineering sync schedule
                                    </p>
                                </div>
                                <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                                    Current Week
                                </span>
                            </div>

                            {/* Timeline Days Bar */}
                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {defaultWeeklySlots.map((slot) => (
                                    <div
                                        key={slot.day}
                                        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                                            slot.isToday
                                                ? "bg-[#6d28d9] text-white shadow-md shadow-purple-950/20 scale-105"
                                                : "bg-purple-50/50 dark:bg-slate-800/40 hover:bg-purple-100/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                                        }`}
                                    >
                                        <span className={`text-[10px] font-bold uppercase ${slot.isToday ? "text-purple-200" : "text-slate-400"}`}>
                                            {slot.day}
                                        </span>
                                        <span className="text-sm sm:text-base font-extrabold mt-0.5">
                                            {slot.date}
                                        </span>
                                        {slot.hasMeeting && (
                                            <span
                                                className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                                                    slot.isToday ? "bg-pink-300" : slot.color
                                                }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Visual Gantt Bar Slot Samples */}
                            <div className="mt-4 pt-4 border-t border-purple-100/60 dark:border-purple-900/30 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-mono text-slate-400 w-12 shrink-0">10:00 AM</span>
                                    <div className="flex-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                                        <span>Live: Silicon Tapeout Sync</span>
                                        <span className="text-[10px] opacity-75">4K CAD 60FPS</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-mono text-slate-400 w-12 shrink-0">02:30 PM</span>
                                    <div className="flex-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-between">
                                        <span>STA Timing & DRC Signoff</span>
                                        <span className="text-[10px] opacity-75">Physical Design</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Meetings Header & Card List */}
                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                                        Today&apos;s Meetings
                                    </h2>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6d28d9] text-[10px] font-bold text-white">
                                        {filteredMeetings.length}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleInstantMeeting}
                                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                                >
                                    + Add New Meet
                                </button>
                            </div>

                            {/* Meeting Cards List - In-Box Scrollable Container (Solves excessive page scrolling) */}
                            <div className="max-h-[460px] sm:max-h-[500px] overflow-y-auto pr-1.5 space-y-3.5 custom-scrollbar overscroll-contain">
                                {filteredMeetings.length > 0 ? (
                                    filteredMeetings.map((meeting) => (
                                        <MeetingCard
                                            key={`${meeting.meetingId}-${meeting.title}`}
                                            title={meeting.title}
                                            date={meeting.date}
                                            time={meeting.time}
                                            participants={meeting.participants}
                                            status={meeting.status}
                                            meetingId={meeting.meetingId}
                                            onDelete={handleDeleteMeeting}
                                            onSelect={() => setSelectedMeetingId(meeting.meetingId)}
                                            isSelected={selectedMeetingId === meeting.meetingId}
                                        />
                                    ))
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-purple-200 dark:border-purple-900 bg-white/50 dark:bg-slate-900/40 p-8 text-center">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            No meetings found matching your search.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleInstantMeeting}
                                            className="mt-3 rounded-full bg-[#6d28d9] px-4 py-2 text-xs font-bold text-white shadow"
                                        >
                                            Create instant meeting
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Meeting Overview Spotlight & Action Items (Behance Style) */}
                    <div className="space-y-6">
                        {/* Meeting Overview Spotlight Card */}
                        {activeMeeting && (
                            <div className="rounded-[2.2rem] border border-purple-100/90 dark:border-purple-900/40 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm relative overflow-hidden">
                                <div className="flex items-center justify-between pb-3 border-b border-purple-100/60 dark:border-purple-900/30">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                        Meeting Overview
                                    </h3>
                                    {activeMeeting.status === "live" ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Live Session
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                                            Upcoming
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <h2 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                                        {activeMeeting.title}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Real-time hardware meeting room with crystal-clear audio and screen sharing.
                                    </p>

                                    {/* Meeting Meta Grid */}
                                    <div className="mt-5 space-y-3 text-xs">
                                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                            <span className="text-slate-400">Status</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {activeMeeting.status === "live" ? "In Progress (60 FPS)" : "Confirmed"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                            <span className="text-slate-400">Timeline</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                {activeMeeting.date} · {activeMeeting.time}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                            <span className="text-slate-400">Session ID</span>
                                            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                                                {activeMeeting.meetingId}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-slate-400">Participants</span>
                                            <div className="flex items-center gap-1">
                                                {activeMeeting.participants.map((p, i) => (
                                                    <span
                                                        key={`${p}-${i}`}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 text-[9px] font-bold text-white"
                                                    >
                                                        {p.charAt(0).toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Engineering Tags */}
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-300">
                                            #PhysicalDesign
                                        </span>
                                        <span className="rounded-full bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-600 dark:text-cyan-300">
                                            #STA_Timing
                                        </span>
                                        <span className="rounded-full bg-pink-50 dark:bg-pink-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-pink-600 dark:text-pink-300">
                                            #4K_CAD
                                        </span>
                                    </div>

                                    {/* Primary Join Button */}
                                    <div className="mt-6 flex flex-col gap-2">
                                        <a
                                            href={`/meet/${activeMeeting.meetingId}`}
                                            className="flex items-center justify-center gap-2 rounded-full bg-[#6d28d9] hover:bg-[#5b21b6] py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/25 transition active:scale-98"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Join Meeting Room Now</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task List Today Card (Checklist from Behance Design) */}
                        <div className="rounded-[2.2rem] border border-purple-100/90 dark:border-purple-900/40 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                    Action Items Today
                                </h3>
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                    {taskPercent}% Done
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 w-full rounded-full bg-purple-100 dark:bg-purple-950/80 overflow-hidden mb-4">
                                <div
                                    className="h-full bg-gradient-to-r from-[#6d28d9] to-pink-500 rounded-full transition-all duration-500"
                                    style={{ width: `${taskPercent}%` }}
                                />
                            </div>

                            {/* Checklist items */}
                            <div className="space-y-2.5">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() =>
                                            setTasks((prev) =>
                                                prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
                                            )
                                        }
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50/60 dark:hover:bg-slate-800/60 transition cursor-pointer"
                                    >
                                        <div
                                            className={`flex h-5 w-5 items-center justify-center rounded-lg border transition ${
                                                task.done
                                                    ? "bg-[#6d28d9] border-[#6d28d9] text-white"
                                                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                            }`}
                                        >
                                            {task.done && (
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs select-none transition ${
                                                task.done
                                                    ? "line-through text-slate-400 dark:text-slate-500"
                                                    : "font-medium text-slate-700 dark:text-slate-200"
                                            }`}
                                        >
                                            {task.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}