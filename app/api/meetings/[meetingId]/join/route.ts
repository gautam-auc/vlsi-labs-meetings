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
    const body = await request.json();
    const { participantName } = body;

    const name = (participantName || "Guest").trim();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, isOffline: true });
    }

    // Add participant to meeting if not already recorded
    await Meeting.findOneAndUpdate(
      { meetingId: cleanId },
      {
        $addToSet: { participants: name },
        $set: { status: "live" }, // Mark active
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, participantName: name });
  } catch (error: any) {
    console.error("Attendance log error:", error);
    return NextResponse.json(
      { error: "Could not record participant attendance." },
      { status: 500 }
    );
  }
}
