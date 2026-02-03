/**
 * Logout API Route
 *
 * Handles user logout requests
 */

import { getSession, logoutUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getSession();
    await logoutUser();

    if (session?.userId) {
      await logAuditEvent({
        userId: session.userId,
        action: "auth.logout",
        entityType: "user",
        entityId: session.userId,
        request,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
