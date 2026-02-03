/**
 * Admin Service
 *
 * Business logic for admin operations
 */

import { supabase } from "@/app/lib/supabase";

/**
 * Get all users with their statistics and subscription data
 * @returns {Promise<Array>} Array of users with stats and subscription info
 */
export async function getAllUsersWithStats() {
  try {
    // Get all users with subscription and usage data
    const { data: users, error: usersError } = await supabase.from("users")
      .select(`
          id,
          name,
          contact_email,
          company_id,
          created_at,
          deactivated_at,
          deleted_at,
          invoices(
            id,
            total_amount,
            currency,
            is_paid,
            is_canceled,
            is_deleted
          ),
          user_subscriptions!left(
            id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            billing_cycle,
            created_at,
            subscription_plans!left(
              id,
              name,
              price_monthly,
              price_yearly,
              invoice_limit_monthly,
              features
            )
          ),
          invoice_usage!left(
            year,
            month,
            invoices_created
          )
        `);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return [];
    }

    // Process users with stats
    const userStats = users.map((user) => {
      const invoices = (user.invoices || []).filter((inv) => !inv.is_deleted);
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter((inv) => inv.is_paid).length;
      const unpaidInvoices = invoices.filter(
        (inv) => !inv.is_paid && !inv.is_canceled
      ).length;
      const totalRevenue = invoices
        .filter((inv) => inv.is_paid)
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

      // Get current subscription (most recent one, regardless of status)
      const currentSubscription =
        user.user_subscriptions?.length > 0
          ? user.user_subscriptions.sort(
              (a, b) =>
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            )[0]
          : null;
      const currentPlan = currentSubscription?.subscription_plans;

      // Get current month usage
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentUsage =
        user.invoice_usage?.find(
          (usage) => usage.year === currentYear && usage.month === currentMonth
        )?.invoices_created || 0;

      return {
        ...user,
        stats: {
          totalInvoices,
          paidInvoices,
          unpaidInvoices,
          totalRevenue,
        },
        subscription: {
          id: currentSubscription?.id,
          plan: currentPlan,
          status: currentSubscription?.status,
          periodStart: currentSubscription?.current_period_start,
          periodEnd: currentSubscription?.current_period_end,
          billingCycle: currentSubscription?.billing_cycle,
          currentUsage,
          canCreateInvoice:
            currentPlan?.invoice_limit_monthly === 0 ||
            currentUsage < currentPlan?.invoice_limit_monthly,
        },
      };
    });

    return userStats;
  } catch (error) {
    console.error("Error in getAllUsersWithStats:", error);
    return [];
  }
}

/**
 * Get subscription plan statistics
 * @returns {Promise<Array|null>} Array of plan statistics or null on error
 */
export async function getSubscriptionStats() {
  try {
    // Get subscription plan statistics
    const { data: plans, error: plansError } = await supabase
      .from("subscription_plans")
      .select(
        `
        id,
        name,
        price_monthly,
        price_yearly,
        invoice_limit_monthly,
        user_subscriptions!inner(
          id,
          status,
          billing_cycle
        )
      `
      )
      .eq("is_active", true);

    if (plansError) {
      console.error("Error fetching subscription stats:", plansError);
      return null;
    }

    // Calculate stats for each plan
    const planStats = plans.map((plan) => ({
      ...plan,
      activeSubscriptions: plan.user_subscriptions.filter(
        (sub) => sub.status === "active" && plan.id > 1
      ).length,
      monthlyRevenue:
        plan.user_subscriptions.filter(
          (sub) =>
            sub.status === "active" &&
            sub.billing_cycle === "monthly" &&
            plan.id > 1
        ).length * plan.price_monthly,
      yearlyRevenue:
        plan.user_subscriptions.filter(
          (sub) =>
            sub.status === "active" &&
            sub.billing_cycle === "yearly" &&
            plan.id > 1
        ).length * plan.price_yearly,
    }));

    return planStats;
  } catch (error) {
    console.error("Error in getSubscriptionStats:", error);
    return null;
  }
}

/**
 * Get pending payments data
 * @returns {Promise<Array>} Array of pending payments
 */
export async function getPendingPayments() {
  try {
    // Get all users with pending payment subscriptions
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        contact_email,
        company_id,
        created_at,
        user_subscriptions!inner(
          id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          billing_cycle,
          variable_symbol,
          subscription_plans!inner(
            id,
            name,
            price_monthly,
            price_yearly,
            invoice_limit_monthly,
            features
          )
        )
      `
      )
      .eq("user_subscriptions.status", "pending_payment");

    if (usersError) {
      console.error("Error fetching pending payments:", usersError);
      return [];
    }

    // Process users with pending payments
    const pendingPayments = users.map((user) => {
      const subscription = user.user_subscriptions[0];
      const plan = subscription?.subscription_plans;

      // Calculate amount based on billing cycle
      const amount =
        subscription.billing_cycle === "yearly"
          ? plan.price_yearly
          : plan.price_monthly;

      return {
        id: user.id,
        name: user.name,
        email: user.contact_email,
        company_id: user.company_id,
        created_at: user.created_at,
        subscription: {
          id: subscription.id,
          plan: plan,
          status: subscription.status,
          billing_cycle: subscription.billing_cycle,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end,
          variable_symbol: subscription.variable_symbol,
          amount: amount,
        },
      };
    });

    return pendingPayments;
  } catch (error) {
    console.error("Error in getPendingPayments:", error);
    return [];
  }
}
