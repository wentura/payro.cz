/**
 * Admin User Restore API
 *
 * Clears deleted_at for soft-deleted users
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing user ID" },
        { status: 400 }
      );
    }

    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id, deleted_at")
      .eq("id", id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { success: false, error: "Uživatel nenalezen" },
        { status: 404 }
      );
    }

    if (!targetUser.deleted_at) {
      return NextResponse.json(
        { success: false, error: "Uživatel není smazán" },
        { status: 400 }
      );
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ deleted_at: null })
      .eq("id", id)
      .select("id, deleted_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Chyba při obnově uživatele" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Uživatel byl obnoven",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin restore error:", error);
    return NextResponse.json(
      { success: false, error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}
