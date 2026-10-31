import { verifyToken } from "./auth";

export function getAdminEmails(): string[] {
    const envEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    return Array.from(new Set(envEmails));
}

export function isUserAdmin(
    email?: string | null,
    role?: string | null
): boolean {
    if (role === "admin") return true;
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    // Strict whitelist: Only verified platform admin emails can EVER see or access the admin center
    return getAdminEmails().includes(normalized);
}

export function verifyAdminRequest(request: Request): boolean {
    const authHeader = request.headers.get("authorization") || "";
    let token = "";
    if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
    }
    if (!token) {
        const cookieHeader = request.headers.get("cookie") || "";
        const match = cookieHeader.match(/vlsilabs_token=([^;]+)/);
        if (match) token = match[1];
    }
    if (!token) return false;

    const payload = verifyToken(token);
    if (!payload) return false;

    return isUserAdmin(payload.email, payload.role);
}

