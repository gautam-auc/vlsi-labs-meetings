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
      return NextResponse.json(
        { error: "Account service is temporarily unavailable. Please try again shortly." },
        { status: 503 }
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

    // New accounts always start as regular users. Promote administrators only
    // through a controlled, authenticated administrative workflow.
    const role = "user";
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
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
          role: newUser.role,
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
