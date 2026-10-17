import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { Message } from "../../../../../models/Message";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const cleanId = (meetingId || "").trim().toUpperCase();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ messages: [], isOffline: true });
    }

    const messages = await Message.find({ meetingId: cleanId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    const mapped = messages.map((m: any) => ({
      id: m._id.toString(),
      senderName: m.senderName,
      text: m.text,
      time: m.time || new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    return NextResponse.json({ messages: mapped });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting messages." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const cleanId = (meetingId || "").trim().toUpperCase();
    const body = await request.json();
    const { senderName, text, time, senderEmail } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Message text is required." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        {
          message: {
            id: `${Date.now()}`,
            senderName: senderName || "Participant",
            text: text.trim(),
            time: time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          isOffline: true,
        },
        { status: 201 }
      );
    }

    const created = await Message.create({
      meetingId: cleanId,
      senderName: senderName || "Participant",
      senderEmail: senderEmail || "",
      text: text.trim(),
      time: time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    return NextResponse.json(
      {
        message: {
          id: created._id.toString(),
          senderName: created.senderName,
          text: created.text,
          time: created.time,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Save message error:", error);
    return NextResponse.json(
      { error: "Failed to save chat message." },
      { status: 500 }
    );
  }
}
