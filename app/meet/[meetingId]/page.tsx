"use client";

import { useParams } from "next/navigation";
import MeetingRoom from "../../../components/meeting/MeetingRoom";

export default function MeetingPage() {
    const params = useParams();

    const rawId = Array.isArray(params.meetingId)
        ? params.meetingId[0]
        : (params.meetingId as string);

    const meetingId = (rawId || "").trim().toUpperCase();

    if (!meetingId) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p>Invalid meeting link.</p>
            </main>
        );
    }

    return <MeetingRoom meetingId={meetingId} />;
}