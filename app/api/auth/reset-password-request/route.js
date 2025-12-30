/**
 * Password Reset Request API Route
 *
 * Generates a magic link for password reset and sends it via email
 */

import { supabase } from "@/app/lib/supabase";
import { sendPasswordResetEmail } from "@/app/lib/email";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contact_email } = body;

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

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

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
      console.error("Failed to send password reset email:", emailResult.error);
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

    return NextResponse.json({
      success: true,
      message: "Pokud účet existuje, byl odeslán email s odkazem pro obnovení hesla.",
    });
  } catch (error) {
    console.error("Error in reset-password-request:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
