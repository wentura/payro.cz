/**
 * Subscription Plans API
 *
 * Get available subscription plans for upgrades
 */

import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET /api/subscription/plans
 * Get all active subscription plans
 */
export async function GET() {
  try {
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching subscription plans:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch subscription plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Subscription plans API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
