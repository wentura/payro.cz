/**
 * Admin User Change Plan API
 *
 * Sets plan to active without payment
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

function getPeriodEnd(billingCycle) {
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }
  return { periodStart: now, periodEnd };
}

export async function POST(request, { params }) {
  try {
    const adminUser = await getCurrentUser();

    if (!adminUser || adminUser.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { planId, billingCycle } = body;

    if (!id || !planId || !billingCycle) {
      return NextResponse.json(
        { success: false, error: "Chybí povinná pole" },
        { status: 400 }
      );
    }

    const { data: targetPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id, name, is_active")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !targetPlan) {
      return NextResponse.json(
        { success: false, error: "Neplatný plán" },
        { status: 400 }
      );
    }

    const { data: currentSubscription, error: subscriptionError } =
      await supabase
        .from("user_subscriptions")
        .select("id, status")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (subscriptionError) {
      return NextResponse.json(
        { success: false, error: "Chyba při načítání předplatného" },
        { status: 500 }
      );
    }

    const { periodStart, periodEnd } = getPeriodEnd(billingCycle);
    const updateData = {
      plan_id: planId,
      status: "active",
      billing_cycle: billingCycle,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    };

    let updatedSubscription;
    if (currentSubscription?.id) {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update(updateData)
        .eq("id", currentSubscription.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: "Chyba při změně plánu" },
          { status: 500 }
        );
      }
      updatedSubscription = data;
    } else {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: id,
          ...updateData,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: "Chyba při vytvoření předplatného" },
          { status: 500 }
        );
      }
      updatedSubscription = data;
    }

    await supabase.from("subscription_status_history").insert({
      subscription_id: updatedSubscription.id,
      old_status: currentSubscription?.status || null,
      new_status: "active",
      reason: "Admin change",
      created_by: adminUser.id,
    });

    return NextResponse.json({
      success: true,
      message: "Plán byl změněn",
      subscription: updatedSubscription,
      plan: targetPlan,
    });
  } catch (error) {
    console.error("Admin change plan error:", error);
    return NextResponse.json(
      { success: false, error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}
