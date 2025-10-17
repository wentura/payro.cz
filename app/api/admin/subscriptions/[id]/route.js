/**
 * Admin Individual Subscription Management API
 *
 * Handles individual subscription operations
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * GET /api/admin/subscriptions/[id]
 * Get specific subscription details
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: subscriptionId } = await params;

    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        id,
        user_id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        created_at,
        updated_at,
        users!inner(
          id,
          name,
          contact_email,
          company_id,
          created_at
        ),
        subscription_plans!inner(
          id,
          name,
          price_monthly,
          price_yearly,
          invoice_limit_monthly,
          features
        )
      `
      )
      .eq("id", subscriptionId)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Get usage data
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const { data: usageData } = await supabase
      .from("invoice_usage")
      .select("year, month, invoices_created")
      .eq("user_id", subscription.user_id)
      .eq("year", currentYear)
      .eq("month", currentMonth)
      .single();

    // Get invoice statistics
    const { data: invoiceStats } = await supabase
      .from("invoices")
      .select("id, total_amount, is_paid, is_canceled, is_deleted")
      .eq("user_id", subscription.user_id)
      .eq("is_deleted", false);

    const totalInvoices = invoiceStats?.length || 0;
    const paidInvoices = invoiceStats?.filter((inv) => inv.is_paid).length || 0;
    const totalRevenue =
      invoiceStats
        ?.filter((inv) => inv.is_paid)
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        ...subscription,
        usage: {
          currentMonth: usageData?.invoices_created || 0,
          totalInvoices,
          paidInvoices,
          totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Admin subscription GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subscriptions/[id]
 * Update subscription
 */
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: subscriptionId } = await params;
    const body = await request.json();
    const { planId, billingCycle, status, extendPeriod } = body;

    // Get current subscription
    const { data: currentSubscription, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (planId !== undefined) updateData.plan_id = planId;
    if (billingCycle !== undefined) updateData.billing_cycle = billingCycle;
    if (status !== undefined) updateData.status = status;

    // Handle period extension
    if (extendPeriod) {
      const currentEnd = new Date(currentSubscription.current_period_end);
      const newEnd = new Date(currentEnd);

      if (billingCycle || currentSubscription.billing_cycle === "monthly") {
        newEnd.setMonth(newEnd.getMonth() + 1);
      } else {
        newEnd.setFullYear(newEnd.getFullYear() + 1);
      }

      updateData.current_period_end = newEnd.toISOString();
    }

    const { data: updatedSubscription, error } = await supabase
      .from("user_subscriptions")
      .update(updateData)
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("Admin subscription PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subscriptions/[id]
 * Cancel subscription
 */
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: subscriptionId } = await params;

    const { data: canceledSubscription, error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error canceling subscription:", error);
      return NextResponse.json(
        { success: false, error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: canceledSubscription,
    });
  } catch (error) {
    console.error("Admin subscription DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
