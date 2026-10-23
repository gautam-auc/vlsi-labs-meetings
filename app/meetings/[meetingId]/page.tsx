import { redirect } from "next/navigation";

export default async function MeetingsRedirect({
    params,
}: {
    params: Promise<{ meetingId: string }>;
}) {
    const { meetingId } = await params;
    // Don't intercept /meetings/create
    if (meetingId === "create") {
        return null;
    }
    redirect(`/meet/${meetingId}`);
}
