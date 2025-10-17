/**
 * Admin Subscription Plans Management API
 *
 * Handles subscription plans CRUD operations
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * GET /api/admin/plans
 * Get all subscription plans
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select(
        `
        *,
        user_subscriptions!left(
          id,
          status,
          billing_cycle
        )
      `
      )
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch plans" },
        { status: 500 }
      );
    }

    // Add statistics to each plan
    const plansWithStats = plans.map((plan) => ({
      ...plan,
      activeSubscriptions:
        plan.user_subscriptions?.filter((sub) => sub.status === "active")
          .length || 0,
      monthlyRevenue:
        plan.user_subscriptions?.filter(
          (sub) => sub.status === "active" && sub.billing_cycle === "monthly"
        ).length * plan.price_monthly || 0,
      yearlyRevenue:
        plan.user_subscriptions?.filter(
          (sub) => sub.status === "active" && sub.billing_cycle === "yearly"
        ).length * plan.price_yearly || 0,
    }));

    return NextResponse.json({
      success: true,
      data: plansWithStats,
    });
  } catch (error) {
    console.error("Admin plans API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/plans
 * Create new subscription plan
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price_monthly,
      price_yearly,
      invoice_limit_monthly,
      features,
      is_active = true,
    } = body;

    if (!name || price_monthly === undefined || price_yearly === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: newPlan, error } = await supabase
      .from("subscription_plans")
      .insert({
        name,
        description,
        price_monthly,
        price_yearly,
        invoice_limit_monthly: invoice_limit_monthly || 0,
        features: features || {},
        is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating plan:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newPlan,
    });
  } catch (error) {
    console.error("Admin plan POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/plans
 * Update subscription plan
 */
export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      price_monthly,
      price_yearly,
      invoice_limit_monthly,
      features,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price_monthly !== undefined) updateData.price_monthly = price_monthly;
    if (price_yearly !== undefined) updateData.price_yearly = price_yearly;
    if (invoice_limit_monthly !== undefined)
      updateData.invoice_limit_monthly = invoice_limit_monthly;
    if (features !== undefined) updateData.features = features;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedPlan, error } = await supabase
      .from("subscription_plans")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating plan:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Admin plan PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
