/**
 * Admin Service
 *
 * Business logic for admin operations — camelCase subscription shape
 */

import { supabase } from "@/app/lib/supabase";

function pickCurrentSubscription(subscriptions) {
  if (!subscriptions?.length) return null;
  return [...subscriptions].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )[0];
}

function mapSubscription(sub, currentUsage = 0) {
  if (!sub) {
    return {
      id: null,
      planId: null,
      plan: null,
      status: null,
      periodStart: null,
      periodEnd: null,
      billingCycle: null,
      variableSymbol: null,
      currentUsage,
      canCreateInvoice: true,
    };
  }
  const plan = sub.subscription_plans || null;
  return {
    id: sub.id,
    planId: sub.plan_id ?? plan?.id ?? null,
    plan,
    status: sub.status,
    periodStart: sub.current_period_start,
    periodEnd: sub.current_period_end,
    billingCycle: sub.billing_cycle,
    variableSymbol: sub.variable_symbol || null,
    currentUsage,
    canCreateInvoice:
      !plan ||
      plan.invoice_limit_monthly === 0 ||
      currentUsage < plan.invoice_limit_monthly,
  };
}

function currentMonthUsage(usageRows) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  return (
    usageRows?.find((u) => u.year === year && u.month === month)
      ?.invoices_created || 0
  );
}

/**
 * Get all users with subscription + month usage (no full invoice scan)
 */
export async function getAllUsersWithStats() {
  try {
    const { data: users, error: usersError } = await supabase.from("users")
      .select(`
          id,
          name,
          contact_email,
          company_id,
          created_at,
          deactivated_at,
          deleted_at,
          user_subscriptions!left(
            id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            billing_cycle,
            variable_symbol,
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

    return (users || []).map((user) => {
      const currentSubscription = pickCurrentSubscription(
        user.user_subscriptions
      );
      const usage = currentMonthUsage(user.invoice_usage);
      return {
        id: user.id,
        name: user.name,
        contact_email: user.contact_email,
        company_id: user.company_id,
        created_at: user.created_at,
        deactivated_at: user.deactivated_at,
        deleted_at: user.deleted_at,
        subscription: mapSubscription(currentSubscription, usage),
      };
    });
  } catch (error) {
    console.error("Error in getAllUsersWithStats:", error);
    return [];
  }
}

/**
 * Single user for admin detail (includes invoice stats for that user only)
 */
export async function getAdminUserDetail(userId) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        contact_email,
        company_id,
        created_at,
        last_login,
        deactivated_at,
        deleted_at,
        user_subscriptions!left(
          id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          billing_cycle,
          variable_symbol,
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
      `
      )
      .eq("id", userId)
      .single();

    if (error || !user) {
      return null;
    }

    const { data: invoiceRows } = await supabase
      .from("invoices")
      .select("total_amount, is_paid, is_canceled")
      .eq("user_id", userId)
      .eq("is_deleted", false);

    const stats = {
      totalInvoices: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      totalRevenue: 0,
    };
    for (const inv of invoiceRows || []) {
      stats.totalInvoices += 1;
      if (inv.is_paid) {
        stats.paidInvoices += 1;
        stats.totalRevenue += parseFloat(inv.total_amount || 0);
      } else if (!inv.is_canceled) {
        stats.unpaidInvoices += 1;
      }
    }

    const currentSubscription = pickCurrentSubscription(
      user.user_subscriptions
    );
    const usage = currentMonthUsage(user.invoice_usage);

    let history = [];
    if (currentSubscription?.id) {
      const { data: historyRows } = await supabase
        .from("subscription_status_history")
        .select("id, old_status, new_status, reason, created_at")
        .eq("subscription_id", currentSubscription.id)
        .order("created_at", { ascending: false })
        .limit(20);
      history = historyRows || [];
    }

    return {
      id: user.id,
      name: user.name,
      contact_email: user.contact_email,
      company_id: user.company_id,
      created_at: user.created_at,
      last_login: user.last_login,
      deactivated_at: user.deactivated_at,
      deleted_at: user.deleted_at,
      stats,
      subscription: mapSubscription(currentSubscription, usage),
      history,
    };
  } catch (error) {
    console.error("Error in getAdminUserDetail:", error);
    return null;
  }
}

/**
 * Subscription plan statistics with correct MRR
 */
export async function getSubscriptionStats() {
  try {
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

    return (plans || []).map((plan) => {
      const activePaid = plan.user_subscriptions.filter(
        (sub) => sub.status === "active" && plan.id > 1
      );
      const monthlyCount = activePaid.filter(
        (s) => s.billing_cycle === "monthly"
      ).length;
      const yearlyCount = activePaid.filter(
        (s) => s.billing_cycle === "yearly"
      ).length;
      const monthlyRevenue = monthlyCount * Number(plan.price_monthly || 0);
      const yearlyRevenue = yearlyCount * Number(plan.price_yearly || 0);
      const mrr =
        monthlyRevenue + yearlyCount * (Number(plan.price_yearly || 0) / 12);

      return {
        ...plan,
        activeSubscriptions: activePaid.length,
        monthlyRevenue,
        yearlyRevenue,
        mrr,
      };
    });
  } catch (error) {
    console.error("Error in getSubscriptionStats:", error);
    return null;
  }
}

/**
 * Pending payments (camelCase)
 */
export async function getPendingPayments() {
  try {
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

    return (users || []).map((user) => {
      const subscription = user.user_subscriptions[0];
      const plan = subscription?.subscription_plans;
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
          planId: subscription.plan_id,
          plan,
          status: subscription.status,
          billingCycle: subscription.billing_cycle,
          periodStart: subscription.current_period_start,
          periodEnd: subscription.current_period_end,
          variableSymbol: subscription.variable_symbol,
          amount,
        },
      };
    });
  } catch (error) {
    console.error("Error in getPendingPayments:", error);
    return [];
  }
}

export function getAdminBankAccount() {
  return (
    process.env.ADMIN_BANK_ACCOUNT ||
    process.env.NEXT_PUBLIC_ADMIN_BANK_ACCOUNT ||
    "Nastavte ADMIN_BANK_ACCOUNT"
  );
}
