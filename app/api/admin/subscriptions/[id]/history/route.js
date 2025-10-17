/**
 * Admin Subscription Status History API
 *
 * Fetches subscription status change history
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * GET /api/admin/subscriptions/[id]/history
 * Get subscription status change history
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: subscriptionId } = await params;

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing subscription ID" },
        { status: 400 }
      );
    }

    console.log("Fetching subscription status history for:", subscriptionId);

    // Get subscription status history
    const { data: history, error: historyError } = await supabase
      .from("subscription_status_history")
      .select(
        `
        id,
        old_status,
        new_status,
        reason,
        created_at,
        created_by,
        users!created_by(
          name,
          contact_email
        )
      `
      )
      .eq("subscription_id", subscriptionId)
      .order("created_at", { ascending: false });

    if (historyError) {
      console.error(
        "Error fetching subscription status history:",
        historyError
      );
      return NextResponse.json(
        { success: false, error: "Failed to fetch status history" },
        { status: 500 }
      );
    }

    console.log(
      "Successfully fetched status history:",
      history?.length || 0,
      "records"
    );

    return NextResponse.json({
      success: true,
      data: history || [],
    });
  } catch (error) {
    console.error("Admin subscription status history error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
