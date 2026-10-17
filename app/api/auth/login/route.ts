import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { User } from "../../../../models/User";
import { verifyPassword, generateToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    if (!db) {
      // Graceful local fallback if MongoDB is not connected yet
      const token = generateToken({
        userId: "local-" + Date.now(),
        email: email.toLowerCase().trim(),
        name: email.split("@")[0] || "User",
      });

      return NextResponse.json({
        message: "Logged in (Local mode)",
        user: {
          name: email.split("@")[0] || "User",
          email: email.toLowerCase().trim(),
          workspace: "VLSI Labs Engineering",
        },
        token,
        isOffline: true,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        workspace: user.workspace,
        profilePreferences: user.profilePreferences,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate. Please try again." },
      { status: 500 }
    );
  }
}
