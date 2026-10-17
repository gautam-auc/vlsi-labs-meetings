import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import { Meeting } from "../../../models/Meeting";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const db = await connectToDatabase();

    if (!db) {
      // Offline fallback: Return standard initial meetings
      return NextResponse.json({
        meetings: [],
        isOffline: true,
      });
    }

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { meetingId: { $regex: search, $options: "i" } },
      ];
    }

    const meetings = await Meeting.find(query).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error("Meetings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, time, duration, mode, participants, hostName, hostEmail } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Meeting title is required." },
        { status: 400 }
      );
    }

    // Generate standard VLSI meeting ID format: VLSI-XXXXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const meetingId = `VLSI-${randomPart}`;

    const parsedParticipants = Array.isArray(participants)
      ? participants
      : typeof participants === "string" && participants.trim()
      ? participants.split(",").map((p: string) => p.trim())
      : ["Host"];

    const db = await connectToDatabase();

    const meetingData = {
      meetingId,
      title: title.trim(),
      description: (description || "").trim(),
      date: mode === "instant" ? "Today" : date || "Scheduled",
      time: mode === "instant" ? "Now" : time || "TBD",
      duration: duration || "30",
      mode: mode || "instant",
      status: "upcoming" as const,
      participants: parsedParticipants,
      hostName: hostName || "A. Gautam",
      hostEmail: hostEmail || "",
    };

    if (!db) {
      return NextResponse.json(
        {
          message: "Meeting created (Local mode)",
          meeting: meetingData,
          shareUrl: `/meet/${meetingId}`,
          isOffline: true,
        },
        { status: 201 }
      );
    }

    const created = await Meeting.create(meetingData);

    return NextResponse.json(
      {
        message: "Meeting created successfully.",
        meeting: created,
        shareUrl: `/meet/${meetingId}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Meeting creation error:", error);
    return NextResponse.json(
      { error: "Failed to create meeting." },
      { status: 500 }
    );
  }
}
