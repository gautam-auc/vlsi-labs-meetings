"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import {
    useUserSession,
    saveUserSession,
    PRESET_ADMINS,
    INITIAL_USERS_DB,
    INITIAL_MEETINGS_DB,
    INITIAL_AUDIT_LOGS,
    WorkspaceUser,
    StoredMeeting,
    AuditLog,
} from "../../../lib/session";

export default function AdminDashboardPage() {
    const activeSession = useUserSession();

    // Local state for interactive editing & persistence in session
    const [users, setUsers] = useState<WorkspaceUser[]>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("vlsilabs_admin_users");
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    // fallback
                }
            }
        }
        return INITIAL_USERS_DB;
    });

    const [meetings, setMeetings] = useState<StoredMeeting[]>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("vlsilabs_meetings");
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    // fallback
                }
            }
        }
        return INITIAL_MEETINGS_DB;
    });

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

    const [activeTab, setActiveTab] = useState<"users" | "meetings" | "storage" | "audit">("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoc, setSelectedDoc] = useState<Record<string, unknown> | null>(null);
    const [toastMessage, setToastMessage] = useState<string>("");

    // MongoDB connection status & sync
    const [dbStatus, setDbStatus] = useState<{
        connected: boolean;
        status: string;
        message: string;
        maskedUri?: string;
        docsCount?: { users: number; meetings: number; auditLogs: number };
    } | null>(null);
    const [isCheckingDb, setIsCheckingDb] = useState(false);
    const [isSyncingDb, setIsSyncingDb] = useState(false);
    const [showMongoGuide, setShowMongoGuide] = useState(false);

    // Fetch MongoDB connection status
    const checkDbStatus = async () => {
        setIsCheckingDb(true);
        try {
            const res = await fetch("/api/database/status");
            const data = await res.json();
            setDbStatus(data);
        } catch {
            setDbStatus({
                connected: false,
                status: "error",
                message: "Failed to communicate with database status API",
            });
        } finally {
            setIsCheckingDb(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        fetch("/api/database/status")
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) setDbStatus(data);
            })
            .catch(() => {
                if (isMounted) {
                    setDbStatus({
                        connected: false,
                        status: "error",
                        message: "Failed to communicate with database status API",
                    });
                }
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // Sync current session state to MongoDB
    const handleSyncToMongoDB = async () => {
        setIsSyncingDb(true);
        try {
            const res = await fetch("/api/database/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    users,
                    meetings,
                    log: {
                        action: "Manual Database Sync",
                        admin: activeSession.name,
                        details: `Synchronized ${users.length} users and ${meetings.length} meetings`,
                        type: "storage",
                    },
                }),
            });
            const result = await res.json();
            if (result.success) {
                showToast(result.message);
                checkDbStatus();
            } else {
                showToast(`Sync note: ${result.message}`);
            }
        } catch {
            showToast("Sync request failed. Verify your network or MONGODB_URI.");
        } finally {
            setIsSyncingDb(false);
        }
    };

    // Show temporary toast
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
    };

    // Multi-admin switcher
    const handleSwitchAdmin = (admin: typeof PRESET_ADMINS[0]) => {
        saveUserSession(admin);
        setAuditLogs((prev) => {
            const newLog: AuditLog = {
                id: `log-${prev.length + 1}-${admin.name.replace(/\s+/g, "")}`,
                action: "Admin Switch",
                actor: `${admin.name} (${admin.role})`,
                target: "Workspace Control Plane",
                timestamp: "Just now",
                status: "Success",
            };
            return [newLog, ...prev];
        });
        showToast(`Switched active administrator profile to ${admin.name} (${admin.role})`);
    };

    // Promote / Demote User Role
    const toggleRole = (userId: string) => {
        setUsers((prev) => {
            const updated = prev.map((u) => {
                if (u.id === userId) {
                    const newRole = u.role === "Administrator" ? "Member" : "Administrator";
                    return { ...u, role: newRole as "Administrator" | "Member" };
                }
                return u;
            });
            if (typeof window !== "undefined") {
                localStorage.setItem("vlsilabs_admin_users", JSON.stringify(updated));
            }
            return updated;
        });
        showToast("User role updated successfully in database.");
    };

    // Delete meeting
    const deleteMeeting = (meetingId: string) => {
        setMeetings((prev) => {
            const updated = prev.filter((m) => m.id !== meetingId);
            if (typeof window !== "undefined") {
                localStorage.setItem("vlsilabs_meetings", JSON.stringify(updated));
            }
            return updated;
        });
        showToast(`Meeting ${meetingId} deleted from database records.`);
    };

    // Export Database as JSON
    const exportDatabaseJSON = () => {
        const payload = {
            metadata: {
                workspace: "VLSI Labs Enterprise",
                exportedAt: "2026-10-15T10:00:00Z",
                schemaVersion: "2.4.0",
                databaseEngine: "MongoDB Compatible / Local Persistence",
            },
            collections: {
                users,
                meetings,
                auditLogs,
                storageSummary: {
                    totalStorageAllocatedMB: 50000,
                    totalStorageUsedMB: 1030,
                    utilizationPercentage: "2.06%",
                },
            },
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "vlsi_labs_database_export.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Database collection dump exported as JSON.");
    };

    // Filtered lists
    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMeetings = meetings.filter(
        (m) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.host && m.host.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalStorageMB = meetings.reduce((acc, m) => acc + (m.storageMB || 150), 0) + 210;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
                        <span className="mr-2 text-emerald-400">✓</span> {toastMessage}
                    </div>
                )}

                {/* JSON Document Viewer Modal */}
                {selectedDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div>
                                    <span className="text-xs font-mono text-indigo-400">MongoDB Document View</span>
                                    <h3 className="text-base font-bold text-white mt-0.5">
                                        Collection Item Details
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDoc(null)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800">
                                {JSON.stringify(selectedDoc, null, 2)}
                            </pre>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDoc(null)}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                                >
                                    Close Inspector
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">

                        {/* Breadcrumb & Header */}
                        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                        Enterprise Control Plane
                                    </span>
                                    <span className="text-xs text-slate-400">· MongoDB & Storage Engine</span>
                                </div>

                                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                                    Admin Dashboard & Database
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Manage multiple administrator profiles, monitor registered users, and inspect workspace meeting storage.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={exportDatabaseJSON}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
                                >
                                    <span>📥</span>
                                    <span>Export Collection JSON</span>
                                </button>

                                <Link
                                    href="/meetings/create"
                                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                                >
                                    + Provision New Meeting
                                </Link>
                            </div>
                        </section>

                        {/* Multi-Admin Switcher Panel */}
                        <section className="mt-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/50 p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                                            Multi-Admin Switcher
                                        </p>
                                    </div>
                                    <h3 className="mt-1 text-base font-bold text-slate-900">
                                        Currently Operating As:{" "}
                                        <span className="text-indigo-600 font-extrabold">{activeSession.name}</span>{" "}
                                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 ml-1">
                                            {activeSession.role}
                                        </span>
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Simulate or authenticate as different administrators to verify granular permissions and system views.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {PRESET_ADMINS.map((adm) => {
                                        const isCurrent = activeSession.email === adm.email;
                                        return (
                                            <button
                                                key={adm.email}
                                                type="button"
                                                onClick={() => handleSwitchAdmin(adm)}
                                                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                                    isCurrent
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400"
                                                        : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                                                }`}
                                            >
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                                    {adm.name.charAt(0)}
                                                </span>
                                                <span>{adm.name}</span>
                                                <span className="opacity-70 text-[10px]">({adm.role.split(" ")[0]})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* MongoDB Database Connection & Sync Status Banner */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">🍃</span>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            MongoDB Storage & Database Connector
                                        </h3>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                dbStatus?.connected
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                    : "bg-amber-100 text-amber-800 border border-amber-300"
                                            }`}
                                        >
                                            {dbStatus?.connected ? "● MongoDB Connected" : "○ Local Enterprise Fallback"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {dbStatus?.connected
                                            ? `Connected to ${dbStatus.maskedUri || "MongoDB"}. Live collections: ${dbStatus.docsCount?.users || 0} users, ${dbStatus.docsCount?.meetings || 0} meetings.`
                                            : "Local persistence is active for all admins and meetings. Connect your MongoDB Atlas URI in environment variables to persist data directly to your MongoDB database."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={checkDbStatus}
                                        disabled={isCheckingDb}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                                    >
                                        <span>{isCheckingDb ? "⌛" : "🔄"}</span>
                                        <span>{isCheckingDb ? "Testing..." : "Test Connection"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSyncToMongoDB}
                                        disabled={isSyncingDb}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition disabled:opacity-50"
                                    >
                                        <span>{isSyncingDb ? "⌛" : "⚡"}</span>
                                        <span>{isSyncingDb ? "Syncing..." : "Sync Data to MongoDB"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowMongoGuide(!showMongoGuide)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                                    >
                                        <span>📖</span>
                                        <span>{showMongoGuide ? "Hide Setup Guide" : "How to Connect MongoDB"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Expandable Step-by-Step MongoDB Guide */}
                            {showMongoGuide && (
                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-300">
                                    <p className="font-bold text-white text-sm">
                                        🚀 How to Connect Your MongoDB Database Step-by-Step:
                                    </p>
                                    <ol className="mt-2.5 space-y-2 list-decimal list-inside text-slate-300">
                                        <li>
                                            <strong className="text-white">MongoDB Atlas (Cloud):</strong> Create a free database at{" "}
                                            <span className="font-mono text-emerald-400">mongodb.com/cloud/atlas</span>.
                                            Click <span className="text-slate-100">Connect &gt; Drivers (Node.js)</span> and copy your connection string.
                                        </li>
                                        <li>
                                            <strong className="text-white">Connection String format:</strong>
                                            <div className="mt-1 rounded bg-slate-950 p-2 font-mono text-emerald-300 text-[11px] overflow-x-auto">
                                                MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/vlsilabs?retryWrites=true&amp;w=majority
                                            </div>
                                        </li>
                                        <li>
                                            <strong className="text-white">Local MongoDB (Compass / Docker):</strong>
                                            <div className="mt-1 rounded bg-slate-950 p-2 font-mono text-emerald-300 text-[11px] overflow-x-auto">
                                                MONGODB_URI=mongodb://localhost:27017/vlsilabs
                                            </div>
                                        </li>
                                        <li>
                                            <strong className="text-white">Apply Variable:</strong> Add <span className="font-mono text-indigo-300">MONGODB_URI</span> into your project environment (or <span className="font-mono text-indigo-300">.env.local</span>).
                                        </li>
                                        <li>
                                            <strong className="text-white">Automatic Persistence:</strong> Once added, click <span className="text-emerald-400 font-semibold">Sync Data to MongoDB</span>. All users, role changes, meeting timings, and storage logs will persist straight into your MongoDB database!
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </section>

                        {/* Top Key Metrics */}
                        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Total Users
                                    </span>
                                    <span className="rounded-lg bg-blue-50 p-2 text-base text-blue-600">👥</span>
                                </div>
                                <p className="mt-3 text-2xl font-extrabold text-slate-900">{users.length}</p>
                                <p className="mt-1 text-xs text-emerald-600 font-medium">
                                    ● {users.filter((u) => u.status === "Active").length} active members
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Meetings Stored
                                    </span>
                                    <span className="rounded-lg bg-indigo-50 p-2 text-base text-indigo-600">📅</span>
                                </div>
                                <p className="mt-3 text-2xl font-extrabold text-slate-900">{meetings.length}</p>
                                <p className="mt-1 text-xs text-indigo-600 font-medium">
                                    Across all engineering squads
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Storage Consumed
                                    </span>
                                    <span className="rounded-lg bg-amber-50 p-2 text-base text-amber-600">💾</span>
                                </div>
                                <p className="mt-3 text-2xl font-extrabold text-slate-900">
                                    {(totalStorageMB / 1024).toFixed(2)} GB
                                </p>
                                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[2.1%]" />
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    50.0 GB Tier · 2.1% used
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Database Engine
                                    </span>
                                    <span className="rounded-lg bg-emerald-50 p-2 text-base text-emerald-600">⚡</span>
                                </div>
                                <p className="mt-3 text-2xl font-extrabold text-emerald-600">Online</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Latency: 12ms · Sub-100ms Mesh
                                </p>
                            </div>
                        </section>

                        {/* Database Tab Navigation & Search */}
                        <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("users")}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                        activeTab === "users"
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    Users Collection ({users.length})
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("meetings")}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                        activeTab === "meetings"
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    Meetings Collection ({meetings.length})
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("storage")}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                        activeTab === "storage"
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    Storage & Buckets
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("audit")}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                        activeTab === "audit"
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    Security Audit Logs
                                </button>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search collection records..."
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* TAB 1: USERS COLLECTION */}
                        {activeTab === "users" && (
                            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Collection: `users`
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Showing {filteredUsers.length} documents
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                                            <tr>
                                                <th className="px-6 py-3">User & Email</th>
                                                <th className="px-4 py-3">Role</th>
                                                <th className="px-4 py-3">Joined</th>
                                                <th className="px-4 py-3">Last Active</th>
                                                <th className="px-4 py-3">Meetings</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{u.name}</p>
                                                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                                u.role.includes("Admin")
                                                                    ? "bg-purple-100 text-purple-700"
                                                                    : u.role === "Guest"
                                                                    ? "bg-slate-100 text-slate-600"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}
                                                        >
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-500">{u.joinedDate}</td>
                                                    <td className="px-4 py-4 text-slate-500">{u.lastActive}</td>
                                                    <td className="px-4 py-4 font-mono font-medium">{u.meetingsCount}</td>
                                                    <td className="px-4 py-4">
                                                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            {u.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedDoc(u as unknown as Record<string, unknown>)}
                                                            className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 transition"
                                                        >
                                                            JSON
                                                        </button>
                                                        {u.role !== "Super Admin" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleRole(u.id)}
                                                                className="rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                                                            >
                                                                {u.role === "Administrator" ? "Make Member" : "Promote Admin"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* TAB 2: MEETINGS COLLECTION */}
                        {activeTab === "meetings" && (
                            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Collection: `meetings`
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Showing {filteredMeetings.length} records
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                                            <tr>
                                                <th className="px-6 py-3">Meeting Details</th>
                                                <th className="px-4 py-3">Room ID</th>
                                                <th className="px-4 py-3">Timing & Duration</th>
                                                <th className="px-4 py-3">Host</th>
                                                <th className="px-4 py-3">Storage</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {filteredMeetings.map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900">{m.title}</p>
                                                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{m.description}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-indigo-700 font-bold">
                                                            {m.id}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-500">
                                                        {m.date} · {m.time} ({m.duration || "30m"})
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-slate-800">{m.host || "A. Gautam"}</td>
                                                    <td className="px-4 py-4 font-mono text-slate-600">{m.storageMB || 180} MB</td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                                m.status === "completed"
                                                                    ? "bg-slate-100 text-slate-600"
                                                                    : "bg-emerald-100 text-emerald-700"
                                                            }`}
                                                        >
                                                            {m.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <Link
                                                            href={`/meet/${m.id}`}
                                                            className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 transition"
                                                        >
                                                            Join Room →
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedDoc(m as unknown as Record<string, unknown>)}
                                                            className="rounded-lg border border-slate-200 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-100 transition"
                                                        >
                                                            JSON
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteMeeting(m.id)}
                                                            className="rounded-lg bg-red-50 px-2 py-1 font-semibold text-red-600 hover:bg-red-100 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* TAB 3: STORAGE & BUCKETS */}
                        {activeTab === "storage" && (
                            <section className="mt-6 space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">
                                                Workspace Storage Allocation & Quotas
                                            </h3>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                MongoDB document storage, WebRTC media recordings, and slide presentations.
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                            Health: Optimal
                                        </span>
                                    </div>

                                    {/* Breakdown bars */}
                                    <div className="mt-6 space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-slate-700">Video Recordings & Screen Share Streams</span>
                                                <span className="text-indigo-600">680 MB</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-indigo-600 h-full w-[66%]" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-slate-700">Audio Streams & Conference Archives</span>
                                                <span className="text-emerald-600">210 MB</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-[20%]" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-slate-700">Interactive Slide Presentations & Canvas Data</span>
                                                <span className="text-amber-600">140 MB</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-amber-500 h-full w-[14%]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                                            <span className="text-xs text-slate-600 font-medium">
                                                Auto-retention set to 90 days with automatic cold storage archiving.
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={exportDatabaseJSON}
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                                        >
                                            Backup All Storage Buckets
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* TAB 4: AUDIT LOGS */}
                        {activeTab === "audit" && (
                            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Collection: `workspace_audit_logs`
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Real-time operational stream
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-100 text-xs">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                                        log.status === "Success"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : log.status === "Warning"
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >
                                                    {log.status === "Success" ? "✓" : "ℹ"}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-slate-900">{log.action}</p>
                                                    <p className="text-slate-500 text-[11px]">
                                                        Actor: <strong className="text-slate-700">{log.actor}</strong> → Target: {log.target}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
