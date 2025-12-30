/**
 * Email Verification API Route
 *
 * Handles email verification via magic link token
 * Activates user account and creates session
 */

import { createSession } from "@/app/lib/auth";
import { verifyEmailToken } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Chybí verifikační token" },
        { status: 400 }
      );
    }

    // Verify token
    const tokenResult = await verifyEmailToken(token);

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, error: tokenResult.error },
        { status: 400 }
      );
    }

    // Check if user is already activated
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, contact_email, activated_at")
      .eq("id", tokenResult.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Uživatel nenalezen" },
        { status: 404 }
      );
    }

    // If already activated, just create session and redirect
    if (user.activated_at) {
      await createSession(user.id, user.contact_email);
      return NextResponse.json({
        success: true,
        message: "Účet je již aktivován",
        alreadyActivated: true,
      });
    }

    // Activate user account
    const { error: updateError } = await supabase
      .from("users")
      .update({ activated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error activating user:", updateError);
      return NextResponse.json(
        { success: false, error: "Chyba při aktivaci účtu" },
        { status: 500 }
      );
    }

    // Delete all verification tokens for this user
    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("user_id", user.id);

    // Create session
    await createSession(user.id, user.contact_email);

    return NextResponse.json({
      success: true,
      message: "Účet byl úspěšně aktivován",
    });
  } catch (error) {
    console.error("Error in verify-email:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

