import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "vlsilabs-secret-key-change-in-production-2026");

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET environment variable is missing in production environment!");
}

export function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured in environment variables.");
  }
  return JWT_SECRET;
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}
