import { TokenPayload, verifyToken } from "./auth";

export function isUserAdmin(
    _email?: string | null,
    role?: string | null
): boolean {
    // Authorization comes from a server-issued role, never from a user-supplied
    // email address or a browser-visible allow-list.
    return role === "admin";
}

export function verifyAdminRequest(request: Request): boolean {
    const payload = getAuthenticatedUser(request);
    return Boolean(payload && isUserAdmin(payload.email, payload.role));
}

export function getAuthenticatedUser(request: Request): TokenPayload | null {
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
    if (!token) return null;

    return verifyToken(token);
}

