import Layout from "@/app/components/Layout";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
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
    // Get invoice statistics
    const { data: invoices, error: invoicesError } = await supabase
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
      .order("created_at", { ascending: false });

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return null;
    }

    // Calculate statistics
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.is_paid).length;
    const unpaidInvoices = invoices.filter(
      (inv) => !inv.is_paid && !inv.is_canceled
    ).length;
    const overdueInvoices = invoices.filter(
      (inv) =>
        !inv.is_paid &&
        !inv.is_canceled &&
        isInvoiceOverdue(inv.due_date, inv.is_paid)
    ).length;

    const totalRevenue = invoices
      .filter((inv) => inv.is_paid)
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    const outstandingAmount = invoices
      .filter((inv) => !inv.is_paid && !inv.is_canceled)
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    // Get recent invoices (last 5)
    const recentInvoices = invoices.slice(0, 5);

    // Get client count
    const { count: clientCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

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

export default async function DashboardPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get dashboard data
  const dashboardData = await getDashboardData(user.id);

  if (!dashboardData) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <p className="text-gray-500">Chyba při načítání dat dashboardu</p>
        </div>
      </Layout>
    );
  }

  const { stats, recentInvoices } = dashboardData;

  return (
    <Layout user={user}>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Přehled vašich faktur a statistik
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="text-sm font-medium text-gray-500">
              Celkem faktur
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalInvoices}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-medium text-gray-500">
              Zaplacené faktury
            </div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {stats.paidInvoices}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-medium text-gray-500">
              Nezaplacené faktury
            </div>
            <div className="mt-2 text-3xl font-bold text-orange-600">
              {stats.unpaidInvoices}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-medium text-gray-500">
              Po splatnosti
            </div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {stats.overdueInvoices}
            </div>
          </Card>
        </div>

        {/* Revenue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-sm font-medium text-gray-500">
              Celkový příjem
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-medium text-gray-500">
              Nesplacené částky
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.outstandingAmount)}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-medium text-gray-500">
              Počet klientů
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {stats.clientCount}
            </div>
          </Card>
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
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Číslo faktury
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum vystavení
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Splatnost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Částka
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {invoice.invoice_number || "Koncept"}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.clients?.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateCZ(invoice.issue_date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateCZ(invoice.due_date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
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
        <Card title="Rychlé akce">
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
    </Layout>
  );
}
