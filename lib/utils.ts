export const PRODUCTION_URL = "https://vlsi-labs-meetings.vercel.app";

/**
 * Returns a globally accessible meeting URL.
 * When running on local development (localhost / 127.0.0.1), it automatically returns
 * the public production URL so links copied and sent to mobile phones, clients, or other devices
 * resolve and open seamlessly.
 */
export function getPublicMeetingUrl(meetingId: string): string {
    if (!meetingId) return "";
    if (typeof window === "undefined") {
        return `${PRODUCTION_URL}/meet/${encodeURIComponent(meetingId)}`;
    }

    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${PRODUCTION_URL}/meet/${encodeURIComponent(meetingId)}`;
    }

    return `${origin}/meet/${encodeURIComponent(meetingId)}`;
}
