/**
 * Logout API Route
 *
 * Handles user logout requests
 */

import { logoutUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await logoutUser();

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
