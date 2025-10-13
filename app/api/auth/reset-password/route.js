/**
 * Password Reset API Route
 *
 * Validates token and updates password
 */

import { hashPassword } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token a heslo jsou povinné" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Heslo musí mít alespoň 8 znaků" },
        { status: 400 }
      );
    }

    // Find and validate token
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { success: false, error: "Neplatný nebo expirovaný token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(resetToken.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired token
      await supabase
        .from("password_reset_tokens")
        .delete()
        .eq("id", resetToken.id);

      return NextResponse.json(
        { success: false, error: "Token vypršel, požadujte nový reset hesla" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
      })
      .eq("id", resetToken.user_id);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci hesla" },
        { status: 500 }
      );
    }

    // Delete used token
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("id", resetToken.id);

    console.log("✓ Password reset successful for user:", resetToken.user_id);

    return NextResponse.json({
      success: true,
      message: "Heslo bylo úspěšně změněno",
    });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
