import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VLSI Labs Meetings",
  description:
    "Connect with your team, share ideas, and get work done—all in one place-VLSI Labs Meetings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}




