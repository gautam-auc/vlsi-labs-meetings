import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { Meeting } from "../../../../models/Meeting";
import { User } from "../../../../models/User";

export async function GET() {
  try {
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        totalMeetings: 0,
        activeMeetings: 0,
        upcomingMeetings: 0,
        completedMeetings: 0,
        totalUsers: 1,
        adminUsers: 1,
        meetings: [],
        users: [],
        daasMetrics: {
          avgDurationMinutes: 0,
          totalHoursConducted: 0,
          estDataTransferredGb: 0,
          activeMeetingRatio: "0%",
        },
        isOffline: true,
      });
    }

    const [totalMeetings, activeMeetings, upcomingMeetings, completedMeetings, totalUsers, adminUsers, meetings, users] =
      await Promise.all([
        Meeting.countDocuments(),
        Meeting.countDocuments({ status: "live" }),
        Meeting.countDocuments({ status: "upcoming" }),
        Meeting.countDocuments({ status: "completed" }),
        User.countDocuments(),
        User.countDocuments({ role: "admin" }),
        Meeting.find().sort({ createdAt: -1 }).limit(100).lean(),
        User.find().select("-password").sort({ createdAt: -1 }).limit(100).lean(),
      ]);

    // Compute DaaS (Data as a Service) & Analytics metrics
    let totalMinutes = 0;
    meetings.forEach((m: any) => {
      const dur = parseInt(m.duration, 10);
      if (!isNaN(dur)) totalMinutes += dur;
    });

    const avgDuration = totalMeetings > 0 ? Math.round(totalMinutes / totalMeetings) : 30;
    const totalHours = (totalMinutes / 60).toFixed(1);
    // Rough estimate: ~1.2 GB per hour of HD video mesh
    const estDataTransferredGb = (parseFloat(totalHours) * 1.2).toFixed(1);

    return NextResponse.json({
      totalMeetings,
      activeMeetings,
      upcomingMeetings,
      completedMeetings,
      totalUsers,
      adminUsers,
      meetings,
      users,
      daasMetrics: {
        avgDurationMinutes: avgDuration,
        totalHoursConducted: parseFloat(totalHours),
        estDataTransferredGb: parseFloat(estDataTransferredGb),
        activeMeetingRatio:
          totalMeetings > 0 ? `${Math.round((activeMeetings / totalMeetings) * 100)}%` : "0%",
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve admin statistics." },
      { status: 500 }
    );
  }
}
