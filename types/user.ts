export interface User {
  id?: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "engineer" | "guest" | string;
  isGuest: boolean;
  provider?: "email" | "google" | "guest";
  avatar?: string;
  department?: string;
  joinedAt?: string;
  lastActive?: string;
}
