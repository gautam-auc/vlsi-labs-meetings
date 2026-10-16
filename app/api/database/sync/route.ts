import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Meeting from "@/models/Meeting";
import WorkspaceAuditLog from "@/models/Workspace";

export async function POST(req: NextRequest) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        {
          success: false,
          message: "MONGODB_URI is not set in environment. Saved to local storage fallback only.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { users, meetings, log } = body;

    let syncedUsers = 0;
    let syncedMeetings = 0;

    if (Array.isArray(users) && users.length > 0) {
      for (const u of users) {
        if (!u.email) continue;
        await User.findOneAndUpdate(
          { email: u.email },
          {
            name: u.name || "VLSI Member",
            email: u.email,
            role: u.role || "engineer",
            isGuest: !!u.isGuest,
            provider: u.provider || "email",
            avatar: u.avatar || "",
          },
          { upsert: true, new: true }
        );
        syncedUsers++;
      }
    }

    if (Array.isArray(meetings) && meetings.length > 0) {
      for (const m of meetings) {
        if (!m.id) continue;
        await Meeting.findOneAndUpdate(
          { id: m.id },
          {
            id: m.id,
            title: m.title || "VLSI Meeting",
            host: m.host || "Host",
            hostEmail: m.hostEmail || "admin@vlsilabs.com",
            date: m.date || new Date().toISOString().split("T")[0],
            time: m.time || "10:00 AM",
            duration: m.duration || "45 mins",
            status: m.status || "upcoming",
            participants: m.participants || [],
            notes: m.notes || "",
            recordingsCount: m.recordingsCount || 0,
          },
          { upsert: true, new: true }
        );
        syncedMeetings++;
      }
    }

    if (log && log.action) {
      await WorkspaceAuditLog.create({
        action: log.action,
        admin: log.admin || "Admin",
        details: log.details || "",
        type: log.type || "admin",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${syncedUsers} users and ${syncedMeetings} meetings with MongoDB.`,
      syncedUsers,
      syncedMeetings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
