/**
 * Admin Users with Subscriptions API
 *
 * Fetches all users with their subscription and usage data
 */

import { getCurrentUser, isAdminUser } from "@/app/lib/auth";
import { getAllUsersWithStats } from "@/app/lib/services/AdminService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userStats = await getAllUsersWithStats();

    return NextResponse.json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    console.error("Error in users-with-subscriptions API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
