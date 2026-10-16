import { useSyncExternalStore } from "react";

export interface UserSession {
    name: string;
    email: string;
    role: string;
    isGuest: boolean;
    provider?: "email" | "google" | "guest";
    avatar?: string;
}

export interface StoredMeeting {
    id: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    duration?: string;
    host?: string;
    participants?: string;
    status: "upcoming" | "in-progress" | "completed";
    storageMB?: number;
    createdAt?: string;
}

export interface WorkspaceUser {
    id: string;
    name: string;
    email: string;
    role: "Super Admin" | "Administrator" | "Member" | "Guest";
    joinedDate: string;
    lastActive: string;
    meetingsCount: number;
    status: "Active" | "Inactive";
}

export interface AuditLog {
    id: string;
    action: string;
    actor: string;
    target: string;
    timestamp: string;
    status: "Success" | "Warning" | "Info";
}

export const PRESET_ADMINS: UserSession[] = [
    {
        name: "A. Gautam",
        email: "agautam@vlsilabs.ai",
        role: "Super Admin",
        isGuest: false,
        provider: "google",
    },
    {
        name: "R. Kumar",
        email: "rkumar@vlsilabs.ai",
        role: "Infrastructure Admin",
        isGuest: false,
        provider: "email",
    },
    {
        name: "Priya Shah",
        email: "pshah@vlsilabs.ai",
        role: "Security Admin",
        isGuest: false,
        provider: "email",
    },
];

export const INITIAL_USERS_DB: WorkspaceUser[] = [
    {
        id: "usr-001",
        name: "A. Gautam",
        email: "agautam@vlsilabs.ai",
        role: "Super Admin",
        joinedDate: "2026-01-10",
        lastActive: "Just now",
        meetingsCount: 48,
        status: "Active",
    },
    {
        id: "usr-002",
        name: "R. Kumar",
        email: "rkumar@vlsilabs.ai",
        role: "Administrator",
        joinedDate: "2026-01-15",
        lastActive: "15 mins ago",
        meetingsCount: 32,
        status: "Active",
    },
    {
        id: "usr-003",
        name: "Priya Shah",
        email: "pshah@vlsilabs.ai",
        role: "Administrator",
        joinedDate: "2026-02-01",
        lastActive: "1 hour ago",
        meetingsCount: 29,
        status: "Active",
    },
    {
        id: "usr-004",
        name: "J. Doe",
        email: "jdoe@vlsilabs.ai",
        role: "Member",
        joinedDate: "2026-02-14",
        lastActive: "Today at 10:14 AM",
        meetingsCount: 16,
        status: "Active",
    },
    {
        id: "usr-005",
        name: "M. Khan",
        email: "mkhan@vlsilabs.ai",
        role: "Member",
        joinedDate: "2026-03-01",
        lastActive: "Yesterday",
        meetingsCount: 11,
        status: "Active",
    },
    {
        id: "usr-006",
        name: "Guest Explorer",
        email: "guest@vlsilabs.ai",
        role: "Guest",
        joinedDate: "Today",
        lastActive: "2 mins ago",
        meetingsCount: 3,
        status: "Active",
    },
];

export const INITIAL_MEETINGS_DB: StoredMeeting[] = [
    {
        id: "VLSI-PROD-DEV",
        title: "Product Development & Synthesis",
        description: "Architecture roadmap review and next-gen gate design discussion.",
        date: "Today",
        time: "03:00 PM",
        duration: "45 mins",
        host: "A. Gautam",
        participants: "AG, RK, PS, JD",
        status: "upcoming",
        storageMB: 280,
        createdAt: "2026-10-15",
    },
    {
        id: "VLSI-CLIENT-SYNC",
        title: "Client Architecture Sync",
        description: "External customer deliverables and cadence check-in.",
        date: "Tomorrow",
        time: "11:30 AM",
        duration: "30 mins",
        host: "R. Kumar",
        participants: "AG, PS, MK",
        status: "upcoming",
        storageMB: 190,
        createdAt: "2026-10-14",
    },
    {
        id: "VLSI-STANDUP",
        title: "Team Standup & Hardware Pipeline",
        description: "Daily engineering blocker review and task assignments.",
        date: "Friday",
        time: "10:00 AM",
        duration: "25 mins",
        host: "A. Gautam",
        participants: "AG, RK, PS, JD, MK",
        status: "upcoming",
        storageMB: 140,
        createdAt: "2026-10-13",
    },
    {
        id: "VLSI-PLANNING",
        title: "Q4 High-Yield Milestone Review",
        description: "Yield analysis, edge AI co-processor sign-off and verification.",
        date: "Completed",
        time: "04:00 PM",
        duration: "60 mins",
        host: "Priya Shah",
        participants: "AG, RK, PS",
        status: "completed",
        storageMB: 420,
        createdAt: "2026-10-12",
    },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
    {
        id: "log-1",
        action: "Admin Session Switch",
        actor: "A. Gautam (Super Admin)",
        target: "Admin Dashboard Control Plane",
        timestamp: "Just now",
        status: "Success",
    },
    {
        id: "log-2",
        action: "Screen Sharing Session",
        actor: "A. Gautam",
        target: "Room VLSI-STANDUP (Mesh Channel)",
        timestamp: "5 mins ago",
        status: "Success",
    },
    {
        id: "log-3",
        action: "Direct Google Sign-In",
        actor: "agautamauc@gmail.com",
        target: "OAuth Simulator Token Grant",
        timestamp: "12 mins ago",
        status: "Success",
    },
    {
        id: "log-4",
        action: "Database Storage Snapshot",
        actor: "System Engine",
        target: "MongoDB collections sync (4 collections, 1.03 GB)",
        timestamp: "1 hour ago",
        status: "Info",
    },
];

const DEFAULT_USER: UserSession = PRESET_ADMINS[0];

function subscribe(callback: () => void) {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

function getUserSnapshot(): string {
    if (typeof window === "undefined") return JSON.stringify(DEFAULT_USER);
    return localStorage.getItem("vlsilabs_user") || JSON.stringify(DEFAULT_USER);
}

function getUserServerSnapshot(): string {
    return JSON.stringify(DEFAULT_USER);
}

export function useUserSession(): UserSession {
    const raw = useSyncExternalStore(subscribe, getUserSnapshot, getUserServerSnapshot);
    try {
        return JSON.parse(raw) as UserSession;
    } catch {
        return DEFAULT_USER;
    }
}

function getMeetingsSnapshot(): string {
    if (typeof window === "undefined") return JSON.stringify(INITIAL_MEETINGS_DB);
    const existing = localStorage.getItem("vlsilabs_meetings");
    if (!existing) {
        localStorage.setItem("vlsilabs_meetings", JSON.stringify(INITIAL_MEETINGS_DB));
        return JSON.stringify(INITIAL_MEETINGS_DB);
    }
    return existing;
}

function getMeetingsServerSnapshot(): string {
    return JSON.stringify(INITIAL_MEETINGS_DB);
}

export function useStoredMeetings(): StoredMeeting[] {
    const raw = useSyncExternalStore(subscribe, getMeetingsSnapshot, getMeetingsServerSnapshot);
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : INITIAL_MEETINGS_DB;
    } catch {
        return INITIAL_MEETINGS_DB;
    }
}

export function saveUserSession(user: UserSession) {
    if (typeof window !== "undefined") {
        localStorage.setItem("vlsilabs_user", JSON.stringify(user));
        window.dispatchEvent(new Event("storage"));
    }
}

export function clearUserSession() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("vlsilabs_user");
        window.dispatchEvent(new Event("storage"));
    }
}
