import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import { Meeting } from "../../../models/Meeting";
import { getAuthenticatedUser } from "../../../lib/admin";

export async function GET(request: Request) {
  try {
    if (!getAuthenticatedUser(request)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json(
        { error: "Meeting service is temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
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

    const meetings = await Meeting.find(query)
      .select("meetingId title description hostName date time duration mode status participants createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(50);
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
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, time, duration, mode, participants } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Meeting title is required." },
        { status: 400 }
      );
    }

    if (title.trim().length > 150) {
      return NextResponse.json({ error: "Meeting title cannot exceed 150 characters." }, { status: 400 });
    }

    if (mode && mode !== "instant" && mode !== "scheduled") {
      return NextResponse.json({ error: "Meeting mode must be instant or scheduled." }, { status: 400 });
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

    if (parsedParticipants.length > 50) {
      return NextResponse.json({ error: "A meeting can have at most 50 invitees." }, { status: 400 });
    }

    const db = await connectToDatabase();

    const meetingData = {
      meetingId,
      title: title.trim(),
      description: (description || "").trim().slice(0, 5000),
      date: mode === "instant" ? "Today" : date || "Scheduled",
      time: mode === "instant" ? "Now" : time || "TBD",
      duration: ["15", "30", "45", "60", "90"].includes(String(duration)) ? String(duration) : "30",
      mode: mode || "instant",
      status: "upcoming" as const,
      participants: parsedParticipants,
      hostId: user.userId,
      hostName: user.name || user.email.split("@")[0],
      hostEmail: user.email,
    };

    if (!db) {
      return NextResponse.json(
        { error: "Meeting service is temporarily unavailable. Please try again shortly." },
        { status: 503 }
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
