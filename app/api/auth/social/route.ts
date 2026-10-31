import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { User } from "../../../../models/User";
import { isUserAdmin } from "../../../../lib/admin";
import { getJwtSecret } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, email, name, avatar } = body;

    if (!provider || !email) {
      return NextResponse.json(
        { error: "Provider and email are required for social login." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name || normalizedEmail.split("@")[0] || "User";
    
    // Strict admin role attribution: ONLY predefined admin emails can get admin access
    const role = isUserAdmin(normalizedEmail) ? "admin" : "user";

    const db = await connectToDatabase();
    let dbUser: any = null;

    if (db) {
      dbUser = await User.findOne({ email: normalizedEmail });
      if (!dbUser) {
        dbUser = await User.create({
          name: displayName,
          email: normalizedEmail,
          password: `oauth_${provider}_${Date.now()}`,
          role,
          workspace: "VLSI Labs",
        });
      } else {
        // If user already exists, update their role if they are an admin
        if (role === "admin" && dbUser.role !== "admin") {
          dbUser.role = "admin";
          await dbUser.save();
        }
      }
    }

    const finalRole = dbUser?.role || role;

    const token = jwt.sign(
      {
        userId: dbUser?._id || `oauth_${Date.now()}`,
        email: normalizedEmail,
        role: finalRole,
      },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: `Successfully authenticated via ${provider}`,
      token,
      user: {
        id: dbUser?._id || `oauth_${Date.now()}`,
        name: displayName,
        email: normalizedEmail,
        role: finalRole,
        avatar: avatar || null,
        provider,
      },
    });
  } catch (error: any) {
    console.error("Social login error:", error);
    return NextResponse.json(
      { error: "Social login authentication failed." },
      { status: 500 }
    );
  }
}
