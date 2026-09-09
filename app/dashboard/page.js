import ServerLayout from "@/app/components/ServerLayout";
import SubscriptionStatus from "@/app/components/SubscriptionStatus";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { getSubscriptionData } from "@/app/lib/services/getSubscriptionData";
import {
  formatCurrency,
  formatDateCZ,
} from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Dashboard Page
 *
 * Main dashboard with overview statistics and recent invoices
 */

async function getDashboardData(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const visibleInvoices = (columns, options) =>
      supabase
        .from("invoices")
        .select(columns, options)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .neq("status_id", 4);

    const [
      recentResult,
      totalResult,
      paidCountResult,
      unpaidCountResult,
      overdueCountResult,
      paidAmountsResult,
      unpaidAmountsResult,
      clientCountResult,
    ] = await Promise.all([
      visibleInvoices(
        `
          id,
          invoice_number,
          issue_date,
          due_date,
          payment_date,
          total_amount,
          currency,
          status_id,
          is_paid,
          is_canceled,
          client_id,
          clients(name)
        `
      )
        .order("created_at", { ascending: false })
        .limit(5),
      visibleInvoices("id", { count: "exact", head: true }),
      visibleInvoices("id", { count: "exact", head: true }).eq("is_paid", true),
      visibleInvoices("id", { count: "exact", head: true })
        .eq("is_paid", false)
        .eq("is_canceled", false)
        .neq("status_id", 1),
      visibleInvoices("id", { count: "exact", head: true })
        .eq("is_paid", false)
        .eq("is_canceled", false)
        .neq("status_id", 1)
        .lt("due_date", today),
      visibleInvoices("total_amount").eq("is_paid", true),
      visibleInvoices("total_amount")
        .eq("is_paid", false)
        .eq("is_canceled", false)
        .neq("status_id", 1),
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    if (recentResult.error) {
      console.error("Error fetching invoices:", recentResult.error);
      return null;
    }

    return {
      stats: {
        totalInvoices: totalResult.count || 0,
        paidInvoices: paidCountResult.count || 0,
        unpaidInvoices: unpaidCountResult.count || 0,
        overdueInvoices: overdueCountResult.count || 0,
        totalRevenue: (paidAmountsResult.data || []).reduce(
          (sum, inv) => sum + parseFloat(inv.total_amount || 0),
          0
        ),
        outstandingAmount: (unpaidAmountsResult.data || []).reduce(
          (sum, inv) => sum + parseFloat(inv.total_amount || 0),
          0
        ),
        clientCount: clientCountResult.count || 0,
      },
      recentInvoices: recentResult.data || [],
    };
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return null;
  }
}

// Invoice status labels (Czech)
const statusLabels = {
  1: "Koncept",
  2: "Odeslaná",
  3: "Zaplacená",
  4: "Stornovaná",
  5: "Po splatnosti",
  6: "Částečně zaplacená",
};

// Invoice status variants for badges
const statusVariants = {
  1: "draft",
  2: "sent",
  3: "paid",
  4: "canceled",
  5: "overdue",
  6: "partial_paid",
};

export default async function DashboardPage({ searchParams }) {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get dashboard data and subscription data in parallel
  const [dashboardData, subscriptionData] = await Promise.all([
    getDashboardData(user.id),
    getSubscriptionData(user.id),
  ]);

  if (!dashboardData) {
    return (
      <ServerLayout user={user}>
        <div className="text-center py-12">
          <p className="text-gray-500">Chyba při načítání dat dashboardu</p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="secondary">Zkusit znovu</Button>
            </Link>
          </div>
        </div>
      </ServerLayout>
    );
  }

  const { stats, recentInvoices } = dashboardData;
  const resolvedSearchParams = await searchParams;
  const showVerifiedBanner = resolvedSearchParams?.verified === "true";

  return (
    <ServerLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-fktr-fg">
            Přehled
          </h1>
          <p className="mt-2 text-sm text-fktr-muted leading-relaxed">
            Stav faktur a rychlé akce
          </p>
        </div>

        {showVerifiedBanner && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">
              Účet je aktivní. Můžete vytvořit první fakturu nebo přidat klienta.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Link
            href="/invoices/unpaid"
            className="hover:no-underline"
          >
            <Card>
              <div className="text-sm font-medium text-fktr-muted">
                Nezaplacené
              </div>
              <div className="mt-3 text-3xl font-medium text-fktr-warning tracking-tight">
                {stats.unpaidInvoices}
              </div>
            </Card>
          </Link>
          <Link
            href="/invoices/overdue"
            className="hover:no-underline"
          >
            <Card>
              <div className="text-sm font-medium text-fktr-muted">
                Po splatnosti
              </div>
              <div className="mt-3 text-3xl font-medium text-fktr-danger tracking-tight">
                {stats.overdueInvoices}
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 mx-auto text-center rounded-lg border border-fktr-border bg-white px-6 py-8">
          <div>
            <div className="text-sm font-medium text-fktr-muted">
              Celkový příjem
            </div>
            <div className="mt-3 text-2xl font-medium text-fktr-fg tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-fktr-muted">
              Nezaplacená částka
            </div>
            <div className="mt-3 text-2xl font-medium text-fktr-fg tracking-tight">
              {formatCurrency(stats.outstandingAmount)}
            </div>
          </div>
        </div>

        <Card
          title="Poslední faktury"
          action={
            <Link
              href="/invoices"
              className="text-sm font-medium text-fktr-accent hover:text-fktr-accent-hover"
            >
              Zobrazit vše →
            </Link>
          }
        >
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-fktr-muted">Zatím nemáte žádné faktury</p>
              <Link
                href="/invoices/new"
                className="mt-4 inline-block text-fktr-accent hover:text-fktr-accent-hover font-medium"
              >
                Vytvořit první fakturu →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-fktr-border">
                <thead className="hidden md:table-header-group">
                  <tr>
                    <th className="px-1 py-3 text-left text-xs font-medium text-fktr-muted uppercase tracking-wider md:w-44">
                      Číslo faktury
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-fktr-muted uppercase tracking-wider md:w-56">
                      Klient
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-fktr-muted uppercase tracking-wider md:w-44">
                      Datum vystavení
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-fktr-muted uppercase tracking-wider md:w-44">
                      Splatnost
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-fktr-muted uppercase tracking-wider md:w-44">
                      Částka
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-fktr-muted uppercase tracking-wider md:w-44">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-fktr-elevated divide-y divide-fktr-border text-xs">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-fktr-bg/80">
                      <td className="px-2 py-2 whitespace-nowrap text-left md:w-44">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-fktr-accent hover:text-fktr-accent-hover text-left font-medium"
                        >
                          {invoice.invoice_number || "Koncept"}
                        </Link>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-fktr-fg max-w-[8ch] md:max-w-56 overflow-hidden text-ellipsis text-left">
                        {invoice.clients?.name || "Malý odběratel"}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-fktr-muted text-left md:w-44">
                        {formatDateCZ(invoice.issue_date)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-fktr-muted text-left md:w-44">
                        {formatDateCZ(invoice.due_date)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-fktr-fg text-left md:w-44">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap hidden md:table-cell md:w-44 text-left">
                        <Badge variant={statusVariants[invoice.status_id]}>
                          {statusLabels[invoice.status_id]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Rychlé akce" className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/invoices/new"
              className="block p-5 rounded-lg border border-dashed border-fktr-border hover:border-fktr-accent hover:bg-fktr-accent-soft transition-colors text-center"
            >
              <div className="font-medium text-fktr-fg">Nová faktura</div>
            </Link>
            <Link
              href="/clients/new"
              className="block p-5 rounded-lg border border-dashed border-fktr-border hover:border-fktr-accent hover:bg-fktr-accent-soft transition-colors text-center"
            >
              <div className="font-medium text-fktr-fg">Nový klient</div>
            </Link>
            <Link
              href="/settings"
              className="block p-5 rounded-lg border border-dashed border-fktr-border hover:border-fktr-accent hover:bg-fktr-accent-soft transition-colors text-center"
            >
              <div className="font-medium text-fktr-fg">Nastavení</div>
            </Link>
          </div>
        </Card>
      </div>
      {/* Subscription Status */}
      <SubscriptionStatus subscription={subscriptionData} />
    </ServerLayout>
  );
}
