import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { User } from "../../../../models/User";
import { verifyAdminRequest } from "../../../../lib/admin";

export async function PATCH(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role || !["admin", "user", "host"].includes(role)) {
      return NextResponse.json(
        { error: "Valid userId and role ('admin', 'user', 'host') are required." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { message: `User role updated to ${role} (Local mode)`, isOffline: true },
        { status: 200 }
      );
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: `User ${updated.name} updated to role '${role}'.`,
      user: updated,
    });
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user role." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ message: "User deleted (Local mode)", isOffline: true });
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: `User ${deleted.name} (${deleted.email}) successfully removed.`,
    });
  } catch (error: any) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}

