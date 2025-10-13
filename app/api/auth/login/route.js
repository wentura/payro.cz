/**
 * Login API Route
 *
 * Handles user login requests
 */

import { loginUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contact_email, password } = body;

    console.log("Login attempt for:", contact_email);

    // Validate input
    if (!contact_email || !password) {
      return NextResponse.json(
        { success: false, error: "Email a heslo jsou povinné" },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await loginUser(contact_email, password);

    console.log("Login result:", {
      success: result.success,
      error: result.error,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    console.log("Login successful for:", result.user.contact_email);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
