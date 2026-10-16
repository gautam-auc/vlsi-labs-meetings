import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Meeting from "@/models/Meeting";
import WorkspaceAuditLog from "@/models/Workspace";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json({
      connected: false,
      status: "not_configured",
      message: "MONGODB_URI environment variable is not configured yet. Using local persistence mode.",
      connectionStringProvided: false,
      docsCount: {
        users: 0,
        meetings: 0,
        auditLogs: 0,
      },
    });
  }

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        connected: false,
        status: "disconnected",
        message: "Could not establish MongoDB connection.",
        connectionStringProvided: true,
      });
    }

    const [userCount, meetingCount, logCount] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Meeting.countDocuments().catch(() => 0),
      WorkspaceAuditLog.countDocuments().catch(() => 0),
    ]);

    // Mask URI for privacy
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");

    return NextResponse.json({
      connected: true,
      status: "connected",
      message: "MongoDB connected successfully.",
      connectionStringProvided: true,
      maskedUri,
      docsCount: {
        users: userCount,
        meetings: meetingCount,
        auditLogs: logCount,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json(
      {
        connected: false,
        status: "error",
        message: errMessage,
        connectionStringProvided: true,
      },
      { status: 500 }
    );
  }
}
