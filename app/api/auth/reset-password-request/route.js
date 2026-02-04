/**
 * Password Reset Request API Route
 *
 * Generates a magic link for password reset and sends it via email
 */

import { supabase } from "@/app/lib/supabase";
import { logAuditEvent } from "@/app/lib/audit";
import { sendPasswordResetEmail } from "@/app/lib/email";
import { getRequestIp, rateLimit } from "@/app/lib/rate-limit";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contact_email } = body;

    const ip = getRequestIp(request);
    const rate = await rateLimit({
      key: `auth:reset-password-request:${ip}`,
      limit: 5,
      windowSeconds: 3600,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Příliš mnoho pokusů. Zkuste to později." },
        { status: 429 }
      );
    }

    if (!contact_email) {
      return NextResponse.json(
        { success: false, error: "Email je povinný" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, contact_email, name")
      .eq("contact_email", contact_email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({
        success: true,
        message: "Pokud účet existuje, byl odeslán reset hesla",
        resetLink: "", // Don't show link if user doesn't exist
      });
    }

    await logAuditEvent({
      userId: user.id,
      action: "auth.password_reset_requested",
      entityType: "user",
      entityId: user.id,
      request,
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4); // 4 hours expiry

    // Delete any existing tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", user.id);

    // Create new token
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error creating reset token:", tokenError);
      return NextResponse.json(
        { success: false, error: "Chyba při vytváření reset tokenu" },
        { status: 500 }
      );
    }

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      {
        id: user.id,
        name: user.name,
        contact_email: user.contact_email,
      },
      token
    );

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", {
        userId: user.id,
        error: emailResult.error,
        env: process.env.NODE_ENV,
      });
      // Don't fail the request - user can try again
      // But log the error for debugging
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při odesílání emailu. Zkuste to prosím později.",
        },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password/${token}`;

    console.info("Password reset email queued:", {
      userId: user.id,
      messageId: emailResult.messageId,
      env: process.env.NODE_ENV,
    });

    return NextResponse.json({
      success: true,
      message:
        "Pokud účet existuje, byl odeslán email s odkazem pro obnovení hesla.",
      resetLink:
        process.env.NODE_ENV !== "production" ? resetLink : undefined,
    });
  } catch (error) {
    console.error("Error in reset-password-request:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
