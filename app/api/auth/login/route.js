/**
 * Login API Route
 *
 * Handles user login requests
 */

import { loginUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { getRequestIp, rateLimit } from "@/app/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contact_email, password } = body;

    if (process.env.NODE_ENV === "production") {
      const ip = getRequestIp(request);
      const rate = await rateLimit({
        key: `auth:login:${ip}`,
        limit: 10,
        windowSeconds: 600,
      });

      if (!rate.allowed) {
        return NextResponse.json(
          { success: false, error: "Příliš mnoho pokusů. Zkuste to později." },
          { status: 429 }
        );
      }
    }

    // Validate input
    if (!contact_email || !password) {
      return NextResponse.json(
        { success: false, error: "Email a heslo jsou povinné" },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await loginUser(contact_email, password);

    if (!result.success) {
      // Check if account is not activated
      if (result.error === "ACCOUNT_NOT_ACTIVATED") {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            message: result.message || "Účet není aktivován",
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    await logAuditEvent({
      userId: result.user.id,
      action: "auth.login",
      entityType: "user",
      entityId: result.user.id,
      metadata: { success: true },
      request,
    });

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
