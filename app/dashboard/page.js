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
  isInvoiceOverdue,
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
    const [invoicesResult, clientCountResult] = await Promise.all([
      supabase
        .from("invoices")
        .select(
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
          is_deleted,
          client_id,
          clients!inner(name)
        `
        )
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .neq("status_id", 4) // Exclude cancelled invoices (status_id = 4)
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    const { data: invoices, error: invoicesError } = invoicesResult;

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return null;
    }

    // Calculate statistics
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.is_paid).length;
    // Unpaid invoices: only sent invoices (status_id = 2, 5, 6), exclude drafts (status_id = 1)
    const unpaidInvoices = invoices.filter(
      (inv) =>
        !inv.is_paid &&
        !inv.is_canceled &&
        inv.status_id !== 1 // Exclude drafts
    ).length;
    const overdueInvoices = invoices.filter(
      (inv) =>
        !inv.is_paid &&
        !inv.is_canceled &&
        inv.status_id !== 1 && // Exclude drafts
        isInvoiceOverdue(inv.due_date, inv.is_paid)
    ).length;

    const totalRevenue = invoices
      .filter((inv) => inv.is_paid)
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    // Outstanding amount: only sent invoices (status_id = 2, 5, 6), exclude drafts (status_id = 1)
    const outstandingAmount = invoices
      .filter(
        (inv) =>
          !inv.is_paid && !inv.is_canceled && inv.status_id !== 1 // Exclude drafts
      )
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    // Get recent invoices (last 5)
    const recentInvoices = invoices.slice(0, 5);

    const { count: clientCount } = clientCountResult;

    return {
      stats: {
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        totalRevenue,
        outstandingAmount,
        clientCount: clientCount || 0,
      },
      recentInvoices,
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Přehled</h1>
        </div>

        {showVerifiedBanner && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">
              Účet je aktivní. Můžete vytvořit první fakturu nebo přidat klienta.
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-4">
          {/* <Link
            href="/invoices"
            className="hover:no-underline hover:shadow-lg transition-all duration-300"
          >
            <Card>
              <div className="text-sm font-medium text-gray-500 text-center">
                Celkem faktur
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 text-center">
                {stats.totalInvoices}
              </div>
            </Card>
          </Link> */}
          {/* <Link
            href="/invoices/paid"
            className="hover:no-underline hover:shadow-lg transition-all duration-300"
          >
            <Card>
              <div className="text-sm font-medium text-gray-500">Zaplacené</div>
              <div className="mt-2 text-3xl font-bold text-green-600">
                {stats.paidInvoices}
              </div>
            </Card>
          </Link> */}
          <Link
            href="/invoices/unpaid"
            className="hover:no-underline hover:shadow-lg transition-all duration-300"
          >
            <Card>
              <div className="text-sm font-medium text-gray-500">
                Nezaplacené
              </div>
              <div className="mt-2 text-3xl font-bold text-orange-600">
                {stats.unpaidInvoices}
              </div>
            </Card>
          </Link>
          <Link
            href="/invoices/overdue"
            className="hover:no-underline hover:shadow-lg transition-all duration-300"
          >
            <Card>
              <div className="text-sm font-medium text-gray-500">
                Po splatnosti
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {stats.overdueInvoices}
              </div>
            </Card>
          </Link>
        </div>

        {/* Revenue Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mx-auto text-center">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Celkový příjem
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">
              Nezaplacená částka
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.outstandingAmount)}
            </div>
          </div>

          {/* <Card>
            <div className="text-sm font-medium text-gray-500">
              Počet klientů
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {stats.clientCount}
            </div>
          </Card> */}
        </div>

        {/* Recent Invoices */}
        <Card
          title="Poslední faktury"
          action={
            <Link
              href="/invoices"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Zobrazit vše →
            </Link>
          }
        >
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Zatím nemáte žádné faktury</p>
              <Link
                href="/invoices/new"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Vytvořit první fakturu →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="hidden md:table-header-group">
                  <tr>
                    <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:w-44">
                      Číslo faktury
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:w-56">
                      Klient
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:w-44">
                      Datum vystavení
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:w-44">
                      Splatnost
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:w-44">
                      Částka
                    </th>
                    <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:w-44">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-xs">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap text-left md:w-44">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-700 text-left"
                        >
                          {invoice.invoice_number || "Koncept"}
                        </Link>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-gray-900 max-w-[8ch] md:max-w-56  overflow-hidden text-ellipsis text-left">
                        {invoice.clients?.name || "N/A"}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-900 text-left md:w-44">
                      {formatDateCZ(invoice.issue_date)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-900 text-left md:w-44">
                        {formatDateCZ(invoice.due_date)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-900 text-left md:w-44">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </td>

                      <td className="px-2 py-4 whitespace-nowrap hidden md:table-cell md:w-44 text-left justify-start">
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

        {/* Quick Actions */}
        <Card title="Rychlé akce" className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/invoices/new"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🧾</div>
              <div className="font-medium text-gray-900">Nová faktura</div>
            </Link>

            <Link
              href="/clients/new"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-gray-900">Nový klient</div>
            </Link>

            <Link
              href="/settings"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium text-gray-900">Nastavení</div>
            </Link>
          </div>
        </Card>
      </div>
      {/* Subscription Status */}
      <SubscriptionStatus subscription={subscriptionData} />
    </ServerLayout>
  );
}
