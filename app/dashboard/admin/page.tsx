"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { isUserAdmin } from "../../../lib/admin";

interface AdminStats {
  totalMeetings: number;
  activeMeetings: number;
  upcomingMeetings: number;
  completedMeetings: number;
  totalUsers: number;
  adminUsers: number;
  meetings: Array<{
    _id?: string;
    meetingId: string;
    title: string;
    description?: string;
    hostName?: string;
    hostEmail?: string;
    status: "live" | "upcoming" | "completed" | "cancelled";
    mode: "instant" | "scheduled";
    duration?: string;
    date: string;
    time: string;
    participants?: string[];
    createdAt?: string;
  }>;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: "admin" | "host" | "user";
    workspace?: string;
    createdAt?: string;
  }>;
  daasMetrics: {
    avgDurationMinutes: number;
    totalHoursConducted: number;
    estDataTransferredGb: number;
    activeMeetingRatio: string;
  };
  isOffline?: boolean;
}

import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "meetings">("overview");

  async function fetchStats() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        throw new Error("Failed to load admin stats");
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Admin stats fetch error:", err);
      setError("Could not connect to the database reporting service.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const email = (localStorage.getItem("vlsilabs_user_email") || "").toLowerCase().trim();
    const role = localStorage.getItem("vlsilabs_user_role") || "";
    const isAuthorized = isUserAdmin(email, role);
    if (!isAuthorized) {
      router.push("/dashboard");
      return;
    }
    fetchStats();
  }, [router]);

  async function handleRoleChange(userId: string, newRole: "admin" | "user") {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionNotice(data.message || `Role updated to ${newRole}`);
        setTimeout(() => setActionNotice(""), 3500);
        fetchStats();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update role");
      }
    } catch (e) {
      console.error("Role update failed:", e);
      setError("Failed to communicate with role update server.");
    }
  }

  function exportMeetingsCsv() {
    if (!stats?.meetings?.length) return;
    const headers = "Meeting ID,Title,Host Name,Host Email,Mode,Status,Date,Time,Duration (min)\n";
    const rows = stats.meetings
      .map(
        (m) =>
          `"${m.meetingId}","${m.title}","${m.hostName || ""}","${m.hostEmail || ""}","${m.mode}","${m.status}","${m.date}","${m.time}","${m.duration || "30"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vlsi_meetings_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportUsersCsv() {
    if (!stats?.users?.length) return;
    const headers = "User ID,Name,Email,Role,Workspace,Created At\n";
    const rows = stats.users
      .map(
        (u) =>
          `"${u._id}","${u.name}","${u.email}","${u.role}","${u.workspace || ""}","${u.createdAt || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vlsi_users_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-200">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Header with Title and Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Admin & DaaS Reports Control Center
                  </h1>
                  <span className="rounded-full bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Live Database
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Full visibility across organization meetings, telemetry, users, and MongoDB storage.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchStats}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </button>

                <button
                  type="button"
                  onClick={exportMeetingsCsv}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Notifications */}
            {actionNotice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ {actionNotice}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
                ⚠ {error}
              </div>
            )}

            {/* Top KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Meetings */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Meetings
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {loading ? "..." : stats?.totalMeetings ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stats?.completedMeetings ?? 0} completed · {stats?.upcomingMeetings ?? 0} upcoming
                </p>
              </div>

              {/* Active Sessions */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active Live Rooms
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {loading ? "..." : stats?.activeMeetings ?? 0}
                </p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  In progress right now
                </p>
              </div>

              {/* Registered Users */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Workspace Users
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {loading ? "..." : stats?.totalUsers ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stats?.adminUsers ?? 1} designated administrators
                </p>
              </div>

              {/* DaaS Bandwidth / Hours */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    DaaS Telemetry
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {loading ? "..." : `${stats?.daasMetrics.totalHoursConducted ?? 0} hrs`}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ~{stats?.daasMetrics.estDataTransferredGb ?? 0} GB streaming bandwidth
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <nav className="flex space-x-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`pb-3 text-sm font-semibold transition border-b-2 ${
                    activeTab === "overview"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  System & DaaS Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className={`pb-3 text-sm font-semibold transition border-b-2 ${
                    activeTab === "users"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  User Management ({stats?.users?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("meetings")}
                  className={`pb-3 text-sm font-semibold transition border-b-2 ${
                    activeTab === "meetings"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Meeting Directory ({stats?.meetings?.length ?? 0})
                </button>
              </nav>
            </div>

            {/* TAB 1: OVERVIEW & DAAS METRICS */}
            {activeTab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Infrastructure Connectivity */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Live Infrastructure Status
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-3 w-3 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">MongoDB Database</p>
                          <p className="text-[11px] text-slate-400">mongodb://127.0.0.1:27017/vlsilabs-meetings</p>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        CONNECTED
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-3 w-3 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">Socket.IO Signaling</p>
                          <p className="text-[11px] text-slate-400">Render Public Engine + Port 4000 Fallback</p>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ONLINE
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-3 w-3 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">WebRTC Media Mesh</p>
                          <p className="text-[11px] text-slate-400">Google STUN Peer-to-Peer Encryption</p>
                        </div>
                      </div>
                      <span className="rounded bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        READY
                      </span>
                    </div>
                  </div>
                </div>

                {/* DaaS Telemetry & Analytics */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Data as a Service (DaaS) Telemetry
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Avg Call Length</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.daasMetrics.avgDurationMinutes ?? 30} mins
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Active Rate</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.daasMetrics.activeMeetingRatio ?? "0%"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Total Hours</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.daasMetrics.totalHoursConducted ?? 0} hrs
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Data Transfer</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.daasMetrics.estDataTransferredGb ?? 0} GB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USER DIRECTORY & ROLE MANAGEMENT */}
            {activeTab === "users" && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Registered Users & Access Roles
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Grant or revoke admin dashboard access for your team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportUsersCsv}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Export Users CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-5">User</th>
                        <th className="py-3 px-5">Email</th>
                        <th className="py-3 px-5">Role</th>
                        <th className="py-3 px-5">Workspace</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {stats?.users?.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">{u.email}</td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                u.role === "admin"
                                  ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">
                            {u.workspace || "VLSI Labs"}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {u.role === "admin" ? (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(u._id, "user")}
                                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                              >
                                Demote to User
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(u._id, "admin")}
                                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Promote to Admin
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MEETING DIRECTORY & AUDIT */}
            {activeTab === "meetings" && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      All Workspace Meetings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Audit all live, scheduled, and past meetings in the database.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportMeetingsCsv}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Export Meetings CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-5">Meeting ID</th>
                        <th className="py-3 px-5">Title</th>
                        <th className="py-3 px-5">Host</th>
                        <th className="py-3 px-5">Schedule</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5 text-right">Join</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {stats?.meetings?.map((m) => (
                        <tr key={m.meetingId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {m.meetingId}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                            {m.title}
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                            {m.hostName || "Host"}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">
                            {m.date} · {m.time}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                m.status === "live"
                                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : m.status === "upcoming"
                                  ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {m.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Link
                              href={`/meet/${m.meetingId}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Open Room →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
