import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { Meeting } from "../../../../../models/Meeting";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const cleanId = (meetingId || "").trim().toUpperCase();
    if (!/^VLSI-[A-Z0-9]{8}$/.test(cleanId)) {
      return NextResponse.json({ error: "Invalid meeting link." }, { status: 400 });
    }

    const body = await request.json();
    const { participantName } = body;

    const name = String(participantName || "Guest").trim().slice(0, 80) || "Guest";

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, isOffline: true });
    }

    // A join link must point to a meeting created by an authenticated host.
    // Do not create records from arbitrary room IDs.
    const meeting = await Meeting.findOneAndUpdate(
      { meetingId: cleanId },
      {
        $addToSet: { participants: name },
        $set: { status: "live" }, // Mark active
      },
      { new: true }
    );

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found or no longer available." }, { status: 404 });
    }

    if (meeting.status === "cancelled") {
      return NextResponse.json({ error: "This meeting has been cancelled." }, { status: 410 });
    }

    return NextResponse.json({ success: true, participantName: name });
  } catch (error: any) {
    console.error("Attendance log error:", error);
    return NextResponse.json(
      { error: "Could not record participant attendance." },
      { status: 500 }
    );
  }
}
