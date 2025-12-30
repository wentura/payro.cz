/**
 * Resend Verification Email API Route
 *
 * Resends email verification link to user
 */

import { createEmailVerificationToken } from "@/app/lib/auth";
import { sendVerificationEmail } from "@/app/lib/email";
import { supabase } from "@/app/lib/supabase";
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
      .select("id, contact_email, name, activated_at")
      .eq("contact_email", contact_email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({
        success: true,
        message: "Pokud účet existuje a není aktivován, byl odeslán aktivační email",
      });
    }

    // Check if user is already activated
    if (user.activated_at) {
      return NextResponse.json({
        success: true,
        message: "Účet je již aktivován. Můžete se přihlásit.",
      });
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
      console.error("Failed to send verification email:", emailResult.error);
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
      message: "Aktivační email byl odeslán. Zkontrolujte svou emailovou schránku.",
    });
  } catch (error) {
    console.error("Error in resend-verification:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

