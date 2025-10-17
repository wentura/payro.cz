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
 * Unpaid Invoices List Page
 *
 * Displays only unpaid invoices (status: sent, draft)
 */

async function getUnpaidInvoices(userId) {
  try {
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching unpaid invoices:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUnpaidInvoices:", error);
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

export default async function UnpaidInvoicesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const invoices = await getUnpaidInvoices(user.id);

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nezaplacené faktury
            </h1>
            <p className="mt-2 text-gray-600">
              Přehled všech nezaplacených faktur ({invoices.length})
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

        {/* Unpaid Invoices List */}
        <Card>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Všechny faktury jsou zaplacené!
              </h3>
              <p className="text-gray-500 mb-6">
                Všechny vaše faktury byly úspěšně uhrazeny
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/invoices/paid">
                  <Button variant="secondary">Zobrazit zaplacené</Button>
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
                  {invoices.map((invoice) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusVariants[invoice.status_id]}>
                          {statusLabels[invoice.status_id]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {invoice.status_id === 1 && (
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="text-orange-600 hover:text-orange-900 mr-4"
                          >
                            Upravit
                          </Link>
                        )}
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
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
                <div className="text-3xl font-bold text-orange-600">
                  {invoices.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Nezaplacené faktury
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(
                    invoices.reduce(
                      (sum, invoice) => sum + (invoice.total_amount || 0),
                      0
                    ),
                    "CZK"
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Celková částka k úhradě
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {invoices.length > 0
                    ? formatCurrency(
                        invoices.reduce(
                          (sum, invoice) => sum + (invoice.total_amount || 0),
                          0
                        ) / invoices.length,
                        "CZK"
                      )
                    : "0 CZK"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Průměrná faktura
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
