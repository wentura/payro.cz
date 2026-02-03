import { comparePassword, destroySession, getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { purgeUserData } from "@/app/lib/gdpr";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Heslo je povinné" },
        { status: 400 }
      );
    }

    const { data: userRecord, error } = await supabase
      .from("users")
      .select("id, password_hash, deleted_at")
      .eq("id", user.id)
      .single();

    if (error || !userRecord) {
      console.error("Error loading user for GDPR delete:", error);
      return NextResponse.json(
        { success: false, error: "Uživatel nenalezen" },
        { status: 404 }
      );
    }

    if (userRecord.deleted_at) {
      return NextResponse.json({
        success: true,
        message: "Účet již byl smazán nebo anonymizován.",
      });
    }

    const isValidPassword = await comparePassword(
      password,
      userRecord.password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Neplatné heslo" },
        { status: 403 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "gdpr.delete",
      entityType: "user",
      entityId: user.id,
      request,
    });

    await purgeUserData(user.id);
    await destroySession();

    return NextResponse.json({
      success: true,
      message:
        "Účet byl anonymizován. Fakturační data mohou být uchována z důvodu zákonné povinnosti.",
    });
  } catch (error) {
    console.error("Error in POST /api/user/gdpr/delete:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
