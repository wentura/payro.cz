/**
 * Admin Subscription Activation API
 *
 * Handles manual activation of pending payment subscriptions
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * POST /api/admin/subscriptions/activate
 * Manually activate a pending payment subscription
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      subscriptionId,
      reason = "Manuální aktivace po obdržení platby",
    } = body;

    console.log("Admin subscription activation request:", {
      userId,
      subscriptionId,
      reason,
    });

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing userId or subscriptionId" },
        { status: 400 }
      );
    }

    // Get the subscription to verify it exists and is pending payment
    const { data: subscription, error: subscriptionError } = await supabase
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
        subscription_plans!inner(
          id,
          name,
          price_monthly,
          price_yearly
        )
      `
      )
      .eq("id", subscriptionId)
      .eq("user_id", userId)
      .single();

    if (subscriptionError || !subscription) {
      console.error("Error fetching subscription:", subscriptionError);
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Check if subscription is in pending_payment or canceled status
    if (
      subscription.status !== "pending_payment" &&
      subscription.status !== "canceled"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Subscription cannot be activated. Current status: ${subscription.status}. Only pending_payment and canceled subscriptions can be activated.`,
        },
        { status: 400 }
      );
    }

    // Check if it's a Free plan (shouldn't need activation)
    if (subscription.subscription_plans.name === "Free") {
      return NextResponse.json(
        {
          success: false,
          error: "Free plans do not require manual activation",
        },
        { status: 400 }
      );
    }

    // Calculate new period dates if subscription was canceled
    let updateData = {
      status: "active",
      updated_at: new Date().toISOString(),
    };

    // If subscription was canceled, extend the period from now
    if (subscription.status === "canceled") {
      const now = new Date();
      const billingCycle = subscription.billing_cycle;

      // Calculate new period end based on billing cycle
      let periodEnd = new Date(now);
      if (billingCycle === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        // Monthly
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      updateData.current_period_start = now.toISOString();
      updateData.current_period_end = periodEnd.toISOString();
    }

    // Update subscription status to active
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("user_subscriptions")
      .update(updateData)
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating subscription status:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to activate subscription" },
        { status: 500 }
      );
    }

    // Create a payment record for tracking
    const planPrice =
      subscription.billing_cycle === "yearly"
        ? subscription.subscription_plans.price_yearly
        : subscription.subscription_plans.price_monthly;

    const { data: paymentRecord, error: paymentError } = await supabase
      .from("subscription_payments")
      .insert({
        subscription_id: subscriptionId,
        amount: planPrice,
        currency: "CZK",
        status: "completed",
        payment_method: "manual_admin",
        transaction_id: `admin_manual_${Date.now()}`,
        processor_response: JSON.stringify({
          reason: reason,
          activated_by: user.id,
          activated_at: new Date().toISOString(),
        }),
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      // Don't fail the activation if payment record creation fails
      console.warn(
        "Payment record creation failed, but subscription was activated"
      );
    }

    console.log("Successfully activated subscription:", {
      subscriptionId: updatedSubscription.id,
      plan: subscription.subscription_plans.name,
      billingCycle: subscription.billing_cycle,
      paymentRecordId: paymentRecord?.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        subscription: updatedSubscription,
        paymentRecord: paymentRecord,
        activatedBy: user.id,
        activatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin subscription activation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
