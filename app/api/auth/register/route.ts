import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { User } from "../../../../models/User";
import { hashPassword, generateToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, workspace } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    if (!db) {
      // Graceful local fallback if MongoDB is not connected yet
      const token = generateToken({
        userId: "local-" + Date.now(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
      });

      return NextResponse.json(
        {
          message: "Account created (Local mode)",
          user: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            workspace: workspace || "VLSI Labs Engineering",
          },
          token,
          isOffline: true,
        },
        { status: 201 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      workspace: workspace || "VLSI Labs Engineering",
    });

    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          workspace: newUser.workspace,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
