import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { Meeting } from "../../../../models/Meeting";
import { verifyAdminRequest } from "../../../../lib/admin";

export async function PATCH(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { meetingId, status } = body;

    if (!meetingId || !status) {
      return NextResponse.json(
        { error: "meetingId and target status are required." },
        { status: 400 }
      );
    }

    const cleanId = meetingId.trim().toUpperCase();
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        message: `Meeting ${cleanId} status updated to ${status} (Local mode)`,
        isOffline: true,
      });
    }

    const updated = await Meeting.findOneAndUpdate(
      { meetingId: cleanId },
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: `Meeting ${cleanId} marked as ${status}.`,
      meeting: updated,
    });
  } catch (error: any) {
    console.error("Admin meeting patch error:", error);
    return NextResponse.json(
      { error: "Failed to update meeting status." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("meetingId");
    const purgeAllCancelled = searchParams.get("purgeCancelled") === "true";

    const db = await connectToDatabase();

    if (purgeAllCancelled) {
      if (!db) {
        return NextResponse.json({ message: "Purged cancelled sessions (Local mode)" });
      }
      const res = await Meeting.deleteMany({ status: { $in: ["cancelled", "completed"] } });
      return NextResponse.json({
        message: `Successfully purged ${res.deletedCount} inactive/cancelled meetings.`,
      });
    }

    if (!meetingId) {
      return NextResponse.json({ error: "meetingId is required." }, { status: 400 });
    }

    const cleanId = meetingId.trim().toUpperCase();
    if (!db) {
      return NextResponse.json({
        message: `Meeting ${cleanId} deleted (Local mode)`,
        isOffline: true,
      });
    }

    const deleted = await Meeting.findOneAndDelete({ meetingId: cleanId });
    if (!deleted) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: `Meeting ${cleanId} deleted from database.`,
      meetingId: cleanId,
    });
  } catch (error: any) {
    console.error("Admin meeting delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting." },
      { status: 500 }
    );
  }
}
