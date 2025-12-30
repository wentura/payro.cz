/**
 * Admin User Deactivation API
 *
 * Handles deactivation and reactivation of user accounts
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * POST /api/admin/users/[id]/deactivate
 * Toggle user deactivation status (deactivate or reactivate)
 */
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Unwrap params Promise (Next.js 15 requirement)
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'deactivate' or 'reactivate'

    console.log("Admin user deactivation request:", {
      userId: id,
      action,
    });

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Prevent admin from deactivating themselves
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: "Nemůžete deaktivovat svůj vlastní účet" },
        { status: 400 }
      );
    }

    // Get the user to verify it exists and check current status
    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id, name, contact_email, deactivated_at")
      .eq("id", id)
      .single();

    if (userError || !targetUser) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { success: false, error: "Uživatel nenalezen" },
        { status: 404 }
      );
    }

    // Determine action based on current status if action not specified
    const isCurrentlyDeactivated = targetUser.deactivated_at !== null;
    const requestedAction = action || (isCurrentlyDeactivated ? "reactivate" : "deactivate");

    // Prepare update data
    let updateData;
    if (requestedAction === "deactivate") {
      if (isCurrentlyDeactivated) {
        return NextResponse.json({
          success: false,
          error: "Uživatel je již deaktivován",
          deactivated: true,
        });
      }
      updateData = {
        deactivated_at: new Date().toISOString(),
      };
    } else if (requestedAction === "reactivate") {
      if (!isCurrentlyDeactivated) {
        return NextResponse.json({
          success: false,
          error: "Uživatel je již aktivní",
          deactivated: false,
        });
      }
      updateData = {
        deactivated_at: null,
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Neplatná akce. Použijte 'deactivate' nebo 'reactivate'" },
        { status: 400 }
      );
    }

    // Update user deactivation status
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, name, contact_email, deactivated_at")
      .single();

    if (updateError) {
      console.error("Error updating user deactivation status:", updateError);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci stavu uživatele" },
        { status: 500 }
      );
    }

    const isDeactivated = updatedUser.deactivated_at !== null;

    console.log("Successfully updated user deactivation status:", {
      userId: updatedUser.id,
      email: updatedUser.contact_email,
      deactivated: isDeactivated,
      action: requestedAction,
    });

    return NextResponse.json({
      success: true,
      deactivated: isDeactivated,
      message: isDeactivated
        ? "Uživatel byl deaktivován"
        : "Uživatel byl reaktivován",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.contact_email,
        deactivated_at: updatedUser.deactivated_at,
      },
    });
  } catch (error) {
    console.error("Admin user deactivation error:", error);
    return NextResponse.json(
      { success: false, error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}

