/**
 * Subscription Service
 *
 * Business logic for subscription operations
 */

import { supabase } from "@/app/lib/supabase";
import { generateUniqueVariableSymbol } from "@/app/lib/variable-symbol";

/**
 * Handle free subscription upgrades
 * @param {string} userId - User ID
 * @param {number} planId - Target plan ID
 * @param {string} billingCycle - Billing cycle (monthly/yearly)
 * @param {Object} currentSubscription - Current subscription data
 * @returns {Promise<Object>} Result object
 */
export async function handleFreeUpgrade(
  userId,
  planId,
  billingCycle,
  currentSubscription
) {
  try {
    // Get the target plan
    const { data: targetPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !targetPlan) {
      return {
        success: false,
        error: "Target plan not found",
        status: 404,
      };
    }

    // Calculate period dates
    const now = new Date();
    const periodStart = new Date(now);
    const periodEnd = new Date(now);

    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    let result;

    if (currentSubscription) {
      // Update existing subscription
      const { data: updatedSubscription, error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          billing_cycle: billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return {
          success: false,
          error: "Failed to update subscription",
          status: 500,
        };
      }

      result = updatedSubscription;
    } else {
      // Create new subscription
      const { data: newSubscription, error: createError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "active",
          billing_cycle: billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating subscription:", createError);
        return {
          success: false,
          error: "Failed to create subscription",
          status: 500,
        };
      }

      result = newSubscription;
    }

    // Log status change
    if (currentSubscription && currentSubscription.status !== "active") {
      await supabase.from("subscription_status_history").insert({
        subscription_id: result.id,
        old_status: currentSubscription.status,
        new_status: "active",
        reason: "Free upgrade",
        created_by: userId,
      });
    }

    return {
      success: true,
      data: {
        subscription: result,
        plan: targetPlan,
        redirectUrl: `/dashboard?upgraded=true&plan=${targetPlan.name}`,
      },
    };
  } catch (error) {
    console.error("Error in handleFreeUpgrade:", error);
    return {
      success: false,
      error: "Failed to process free upgrade",
      status: 500,
    };
  }
}

/**
 * Handle paid subscription upgrades
 * @param {string} userId - User ID
 * @param {number} planId - Target plan ID
 * @param {string} billingCycle - Billing cycle (monthly/yearly)
 * @param {number} price - Subscription price
 * @param {Object} targetPlan - Target plan data
 * @param {Object} currentSubscription - Current subscription data
 * @returns {Promise<Object>} Result object
 */
export async function handlePaidUpgrade(
  userId,
  planId,
  billingCycle,
  price,
  targetPlan,
  currentSubscription
) {
  try {
    // Calculate period dates
    const now = new Date();
    const periodStart = new Date(now);
    const periodEnd = new Date(now);

    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Generate unique variable symbol for bank transfer tracking
    const variableSymbol = await generateUniqueVariableSymbol(supabase);

    let result;

    if (currentSubscription) {
      // Update existing subscription
      const { data: updatedSubscription, error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          status: "pending_payment",
          billing_cycle: billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          variable_symbol: variableSymbol,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return {
          success: false,
          error: "Failed to update subscription",
          status: 500,
        };
      }

      result = updatedSubscription;
    } else {
      // Create new subscription
      const { data: newSubscription, error: createError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "pending_payment",
          billing_cycle: billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          variable_symbol: variableSymbol,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating subscription:", createError);
        return {
          success: false,
          error: "Failed to create subscription",
          status: 500,
        };
      }

      result = newSubscription;
    }

    // Log status change
    if (
      currentSubscription &&
      currentSubscription.status !== "pending_payment"
    ) {
      await supabase.from("subscription_status_history").insert({
        subscription_id: result.id,
        old_status: currentSubscription.status,
        new_status: "pending_payment",
        reason: "Paid upgrade initiated",
        created_by: userId,
      });
    }

    // Create redirect URL with payment details
    const redirectUrl = `/subscription/pending?plan_name=${encodeURIComponent(
      targetPlan.name
    )}&billing_cycle=${billingCycle}&amount=${price}&variable_symbol=${variableSymbol}`;

    return {
      success: true,
      data: {
        subscription: result,
        plan: targetPlan,
        redirectUrl,
        variableSymbol,
      },
    };
  } catch (error) {
    console.error("Error in handlePaidUpgrade:", error);
    return {
      success: false,
      error: "Failed to process paid upgrade",
      status: 500,
    };
  }
}

/**
 * Get user's current subscription status
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Current subscription data or null
 */
export async function getCurrentSubscription(userId) {
  try {
    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans!inner(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error("Error in getCurrentSubscription:", error);
    return null;
  }
}

/**
 * Check if user can create an invoice
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether user can create invoice
 */
export async function canUserCreateInvoice(userId) {
  try {
    const { data: canCreate, error } = await supabase.rpc(
      "can_user_create_invoice",
      { user_uuid: userId }
    );

    if (error) {
      console.error("Error checking invoice limit:", error);
      return false;
    }

    return canCreate;
  } catch (error) {
    console.error("Error in canUserCreateInvoice:", error);
    return false;
  }
}

/**
 * Increment user's invoice usage for current month
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function incrementInvoiceUsage(userId) {
  try {
    const { error } = await supabase.rpc("increment_invoice_usage", {
      user_uuid: userId,
    });

    if (error) {
      console.error("Error incrementing invoice usage:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in incrementInvoiceUsage:", error);
    return false;
  }
}
