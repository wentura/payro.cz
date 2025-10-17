import Layout from "@/app/components/Layout";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency, formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Overdue Invoices List Page
 *
 * Displays invoices that are overdue based on due_date being in the past
 */

async function getOverdueInvoices(userId) {
  try {
    // Get all unpaid invoices (draft and sent status)
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        clients!inner(name)
      `
      )
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .in("status_id", [1, 2]) // Status 1 = "Koncept", 2 = "Odeslaná"
      .order("due_date", { ascending: true }); // Order by due date, oldest first

    if (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }

    // Filter invoices that are overdue (due_date is in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    const overdueInvoices = (data || []).filter((invoice) => {
      if (!invoice.due_date) return false;

      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0); // Reset time to start of day

      return dueDate < today;
    });

    return overdueInvoices;
  } catch (error) {
    console.error("Error in getOverdueInvoices:", error);
    return [];
  }
}

const statusLabels = {
  1: "Koncept",
  2: "Odeslaná",
  3: "Zaplacená",
  4: "Stornovaná",
  5: "Po splatnosti",
  6: "Částečně zaplacená",
};

const statusVariants = {
  1: "draft",
  2: "sent",
  3: "paid",
  4: "canceled",
  5: "overdue",
  6: "partial_paid",
};

export default async function OverdueInvoicesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const invoices = await getOverdueInvoices(user.id);

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Po splatnosti</h1>
            <p className="mt-2 text-gray-600">
              Přehled všech faktur po splatnosti ({invoices.length})
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/invoices">
              <Button variant="secondary">Všechny faktury</Button>
            </Link>
            <Link href="/invoices/new">
              <Button variant="primary">+ Nová faktura</Button>
            </Link>
          </div>
        </div>

        {/* Overdue Invoices List */}
        <Card>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Žádné faktury po splatnosti!
              </h3>
              <p className="text-gray-500 mb-6">
                Všechny vaše faktury jsou v termínu nebo již zaplacené
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/invoices/unpaid">
                  <Button variant="secondary">Nezaplacené faktury</Button>
                </Link>
                <Link href="/invoices/new">
                  <Button variant="primary">+ Vytvořit fakturu</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Číslo faktury
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum vystavení
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Splatnost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dny po splatnosti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Částka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => {
                    // Calculate days overdue
                    const today = new Date();
                    const dueDate = new Date(invoice.due_date);
                    const daysOverdue = Math.floor(
                      (today - dueDate) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            {invoice.invoice_number || "Koncept"}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.clients?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateCZ(invoice.issue_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateCZ(invoice.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              daysOverdue <= 7
                                ? "bg-yellow-100 text-yellow-800"
                                : daysOverdue <= 30
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {daysOverdue} dní
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(
                            invoice.total_amount,
                            invoice.currency
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="overdue">Po splatnosti</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Summary Stats */}
        {invoices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {invoices.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Faktury po splatnosti
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-700">
                  {formatCurrency(
                    invoices.reduce(
                      (sum, invoice) => sum + (invoice.total_amount || 0),
                      0
                    ),
                    "CZK"
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Celková částka po splatnosti
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {invoices.length > 0
                    ? Math.round(
                        invoices.reduce((sum, invoice) => {
                          const today = new Date();
                          const dueDate = new Date(invoice.due_date);
                          return (
                            sum +
                            Math.floor(
                              (today - dueDate) / (1000 * 60 * 60 * 24)
                            )
                          );
                        }, 0) / invoices.length
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Průměrně dní po splatnosti
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Warning Alert for Overdue Invoices */}
        {invoices.length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Pozor: Máte {invoices.length} faktur po splatnosti
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Doporučujeme kontaktovat klienty a připomenout jim uhrazení
                    těchto faktur. Čím déle jsou faktury nezaplacené, tím
                    obtížnější může být jejich vymáhání.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
