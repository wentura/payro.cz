/**
 * Password Reset API Route
 *
 * Validates token and updates password
 */

import { hashPassword, hashToken } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { parseWithSchema } from "@/app/lib/api-validation";
import { supabase } from "@/app/lib/supabase";
import { passwordResetSchema } from "@/app/lib/validations";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = parseWithSchema(passwordResetSchema, {
      ...body,
      password_confirm: body.password_confirm || body.password,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at")
      .eq("token", hashToken(token))
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

    await logAuditEvent({
      userId: resetToken.user_id,
      action: "auth.password_reset_completed",
      entityType: "user",
      entityId: resetToken.user_id,
      request,
    });

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
