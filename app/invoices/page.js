import ServerLayout from "@/app/components/ServerLayout";
import Pagination from "@/app/components/Pagination";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import {
  getInvoicesWithFilters,
  INVOICE_PAGE_SIZE,
} from "@/app/lib/services/InvoiceService";
import { formatCurrency, formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import ShowCancelledToggle from "./ShowCancelledToggle";

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

export default async function InvoicesPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const includeCancelled = params?.showCancelled === "true";
  const page = Math.max(1, Number.parseInt(params?.page, 10) || 1);
  const { invoices, total, pageSize } = await getInvoicesWithFilters(user.id, {
    page,
    exclude_status_ids: includeCancelled ? undefined : [4],
  });

  const queryForPage = (nextPage) => {
    const search = new URLSearchParams();
    if (includeCancelled) search.set("showCancelled", "true");
    if (nextPage > 1) search.set("page", String(nextPage));
    const qs = search.toString();
    return qs ? `/invoices?${qs}` : "/invoices";
  };

  return (
    <ServerLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between text-center md:text-left">
          <div className="mx-auto md:mx-0">
            <h1 className="text-3xl font-bold text-gray-900">Faktury</h1>
            <p className="mt-2 text-gray-600">
              Správa vašich faktur ({total})
            </p>
          </div>
          <div className="space-x-3 hidden md:flex">
            <Link href="/invoices/unpaid">
              <Button variant="secondary">Nezaplacené</Button>
            </Link>
            <Link href="/invoices/paid">
              <Button variant="secondary">Zaplacené</Button>
            </Link>
            <Link href="/invoices/overdue">
              <Button variant="secondary">Po splatnosti</Button>
            </Link>
            <Link href="/invoices/canceled">
              <Button variant="secondary">Zrušené</Button>
            </Link>
            <Link href="/invoices/new">
              <Button variant="primary">+ Nová faktura</Button>
            </Link>
          </div>
        </div>
        <div className="flex space-x-3 md:hidden text-blue-600 hover:text-blue-900 justify-center">
          <Link href="/invoices/unpaid">Nezaplacené</Link>
          <Link href="/invoices/paid">Zaplacené</Link>
          <Link href="/invoices/overdue">Po splatnosti</Link>
          <Link href="/invoices/canceled">Zrušené</Link>
          <Link href="/invoices/new">Nová faktura</Link>
        </div>

        <ShowCancelledToggle includeCancelled={includeCancelled} />

        <Card>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Zatím nemáte žádné faktury
              </h3>
              <p className="text-gray-500 mb-6">
                Začněte vytvořením první faktury
              </p>
              <Link href="/invoices/new">
                <Button variant="primary">+ Vytvořit první fakturu</Button>
              </Link>
            </div>
          ) : (
            <>
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
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
                          {invoice.clients?.name || "Malý odběratel"}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium hidden md:table-cell text-left">
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
                            className="text-blue-600 hover:text-blue-900 hidden md:table-cell"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                pageSize={pageSize || INVOICE_PAGE_SIZE}
                total={total}
                makeHref={queryForPage}
              />
            </>
          )}
        </Card>
      </div>
    </ServerLayout>
  );
}
