import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { Meeting } from "../../../../models/Meeting";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const cleanId = (meetingId || "").trim().toUpperCase();

    const db = await connectToDatabase();

    if (!db) {
      // Local/mock fallback: allow joining any valid format meeting ID
      return NextResponse.json({
        meeting: {
          meetingId: cleanId,
          title: "VLSI Technical Session",
          status: "upcoming",
          date: "Today",
          time: "Now",
        },
        isOffline: true,
      });
    }

    const meeting = await Meeting.findOne({ meetingId: cleanId });

    if (!meeting) {
      // Per PDF: allow instant/dynamic meeting links even if not pre-scheduled
      return NextResponse.json({
        meeting: {
          meetingId: cleanId,
          title: "Ad-hoc VLSI Meeting",
          status: "upcoming",
          date: "Today",
          time: "Now",
        },
        isAdHoc: true,
      });
    }

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Meeting lookup error:", error);
    return NextResponse.json(
      { error: "Could not retrieve meeting details." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const cleanId = (meetingId || "").trim().toUpperCase();

    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        message: "Meeting cancelled (Local mode)",
        meetingId: cleanId,
        isOffline: true,
      });
    }

    const deleted = await Meeting.findOneAndDelete({ meetingId: cleanId });

    if (!deleted) {
      return NextResponse.json(
        { error: "Meeting not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Meeting cancelled successfully.",
      meetingId: cleanId,
    });
  } catch (error: any) {
    console.error("Meeting deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting." },
      { status: 500 }
    );
  }
}
