/**
 * Admin Users with Subscriptions API
 *
 * Fetches all users with their subscription and usage data
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with subscription and usage data
    const { data: users, error: usersError } = await supabase.from("users")
      .select(`
          id,
          name,
          contact_email,
          company_id,
          created_at,
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
      return NextResponse.json(
        { success: false, error: "Failed to fetch users" },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    console.error("Error in users-with-subscriptions API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
