export const DEFAULT_ADMIN_EMAILS = [
    "agautamauc@gmail.com",
    "agautamrpr@gmail.com",
];

export function getAdminEmails(): string[] {
    const envEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envEmails]));
}

export function isUserAdmin(
    email?: string | null,
    role?: string | null
): boolean {
    if (role === "admin") return true;
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    return getAdminEmails().includes(normalized);
}
