/**
 * Resend Verification Email API Route
 *
 * Resends email verification link to user
 */

import { createEmailVerificationToken, normalizeEmail } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { sendVerificationEmail } from "@/app/lib/email";
import { getRequestIp, rateLimit } from "@/app/lib/rate-limit";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const ip = getRequestIp(request);
    const rate = await rateLimit({
      key: `auth:resend-verification:${ip}`,
      limit: 5,
      windowSeconds: 3600,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Příliš mnoho pokusů. Zkuste to později." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { contact_email } = body;
    const email = typeof contact_email === "string" ? normalizeEmail(contact_email) : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email je povinný" },
        { status: 400 }
      );
    }

    const genericSuccess = {
      success: true,
      message: "Pokud účet existuje a není aktivován, byl odeslán aktivační email",
    };

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, contact_email, name, activated_at")
      .eq("contact_email", email)
      .single();

    if (userError || !user || user.activated_at) {
      return NextResponse.json(genericSuccess);
    }

    // Create new verification token
    const tokenResult = await createEmailVerificationToken(user.id);

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, error: tokenResult.error },
        { status: 500 }
      );
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(
      {
        id: user.id,
        name: user.name,
        contact_email: user.contact_email,
      },
      tokenResult.token
    );

    if (!emailResult.success) {
      console.error("[Email] resend verification failed:", {
        userId: user.id,
        error: emailResult.error,
      });
      return NextResponse.json(genericSuccess);
    }

    console.info("[Email] resend verification sent:", {
      userId: user.id,
      messageId: emailResult.messageId,
    });

    await logAuditEvent({
      userId: user.id,
      action: "auth.verification_email_sent",
      entityType: "user",
      entityId: user.id,
      request,
    });

    return NextResponse.json(genericSuccess);
  } catch (error) {
    console.error("Error in resend-verification:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}


