import Layout from "@/app/components/Layout";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency, formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActivateInvoiceButtonWrapper from "./ActivateInvoiceButtonWrapper";

/**
 * Canceled Invoices List Page
 *
 * Displays only canceled invoices (status_id = 4)
 */

async function getCanceledInvoices(userId) {
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
      .eq("status_id", 4) // Status 4 = "Stornovaná"
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching canceled invoices:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCanceledInvoices:", error);
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

export default async function CanceledInvoicesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const invoices = await getCanceledInvoices(user.id);

  return (
    <Layout user={user}>
      <div className="space-y-6 w-full mx-auto">
        {/* Page Header */}
        <div className="flex justify-between text-center md:text-left max-w-7xl mx-auto">
          <div className="mx-auto md:mx-0 max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-900 mx-auto">
              Zrušené faktury
            </h1>
            <p className="mt-2 text-gray-600">
              Přehled všech zrušených faktur ({invoices.length})
            </p>
          </div>
          <div className="space-x-3 hidden md:flex">
            <Link href="/invoices">
              <Button variant="secondary">Všechny faktury</Button>
            </Link>
            <Link href="/invoices/unpaid">
              <Button variant="secondary">Nezaplacené</Button>
            </Link>
            <Link href="/invoices/paid">
              <Button variant="secondary">Zaplacené</Button>
            </Link>
            <Link href="/invoices/overdue">
              <Button variant="secondary">Po splatnosti</Button>
            </Link>
            <Link href="/invoices/new">
              <Button variant="primary">+ Nová faktura</Button>
            </Link>
          </div>
        </div>
        <div className="flex space-x-3 md:hidden text-blue-600 hover:text-blue-900 justify-center">
          <Link href="/invoices">Všechny faktury</Link>
          <Link href="/invoices/unpaid">Nezaplacené</Link>
          <Link href="/invoices/paid">Zaplacené</Link>
          <Link href="/invoices/overdue">Po splatnosti</Link>
          <Link href="/invoices/new">Nová faktura</Link>
        </div>
        {/* Canceled Invoices List */}
        <Card>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Žádné zrušené faktury
              </h3>
              <p className="text-gray-500 mb-6">
                Nemáte žádné zrušené faktury
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/invoices">
                  <Button variant="secondary">Všechny faktury</Button>
                </Link>
                <Link href="/invoices/new">
                  <Button variant="primary">+ Vytvořit fakturu</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full mx-auto">
              <table className="min-w-full divide-y divide-gray-200 max-w-7xl mx-auto">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Číslo faktury
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Datum vystavení
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Splatnost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Částka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          {invoice.invoice_number || "Koncept"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[8ch] md:max-w-56 overflow-hidden text-ellipsis text-left">
                        {invoice.clients?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell text-left">
                        {formatDateCZ(invoice.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {formatDateCZ(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left text-gray-900">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-left">
                        <Badge variant={statusVariants[invoice.status_id]}>
                          {statusLabels[invoice.status_id]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium hidden md:table-cell">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </Link>
                          <ActivateInvoiceButtonWrapper invoiceId={invoice.id} />
                        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {invoices.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Zrušené faktury
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {formatCurrency(
                    invoices.reduce(
                      (sum, invoice) => sum + (invoice.total_amount || 0),
                      0
                    ),
                    "CZK"
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Celková částka zrušených faktur
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

