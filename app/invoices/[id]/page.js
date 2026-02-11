import Layout from "@/app/components/Layout";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { getUnits } from "@/app/lib/services/getReferenceData";
import { formatCurrency, formatDateCZ, formatNumber } from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import DuplicateInvoiceButtonWrapper from "./DuplicateInvoiceButtonWrapper";

/**
 * Invoice Detail Page
 *
 * Display invoice details and allow status changes
 */

async function getInvoice(invoiceId, userId) {
  try {
    const [invoiceResult, itemsResult] = await Promise.all([
      supabase
        .from("invoices")
        .select(
          `
          *,
          clients!inner(*)
        `
        )
        .eq("id", invoiceId)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("order_number", { ascending: true }),
    ]);

    const { data: invoice, error: invoiceError } = invoiceResult;

    if (invoiceError || !invoice) {
      return null;
    }

    const { data: items, error: itemsError } = itemsResult;

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
      return { ...invoice, items: [] };
    }

    return { ...invoice, items: items || [] };
  } catch (error) {
    console.error("Error in getInvoice:", error);
    return null;
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

export default async function InvoiceDetailPage({ params }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [invoice, units] = await Promise.all([
    getInvoice(id, user.id),
    getUnits(),
  ]);

  if (!invoice) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <p className="text-red-500">Faktura nenalezena</p>
          <Link href="/invoices" className="mt-4 inline-block">
            <Button>Zpět na faktury</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Create unit lookup
  const unitLookup = units.reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {});

  const showUnitPriceColumn = invoice.items.some((item) => {
    if (
      item.unit_price === null ||
      item.unit_price === undefined ||
      item.unit_price === ""
    ) {
      return false;
    }

    const numericUnitPrice = Number(item.unit_price);
    return !Number.isNaN(numericUnitPrice) && numericUnitPrice !== 0;
  });

  const showQuantityColumn = invoice.items.some((item) => {
    const quantity =
      item.quantity !== null && item.quantity !== undefined
        ? Number(item.quantity)
        : null;

    return quantity !== null && !Number.isNaN(quantity) && quantity !== 1;
  });

  const showUnitColumn = invoice.items.some((item) => {
    if (!item.unit_id) {
      return false;
    }

    const unit = unitLookup[item.unit_id];
    return Boolean(unit?.abbreviation);
  });

  const totalLabelColSpan =
    2 +
    (showQuantityColumn ? 1 : 0) +
    (showUnitColumn ? 1 : 0) +
    (showUnitPriceColumn ? 1 : 0);

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {invoice.invoice_number || "Koncept faktury"}
            </h1>
            <p className="mt-2 text-gray-600">
              Detail faktury pro {invoice.clients?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={statusVariants[invoice.status_id]}>
              {statusLabels[invoice.status_id]}
            </Badge>
            <Link href="/invoices">
              <Button variant="secondary">Zpět na seznam</Button>
            </Link>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Informace o faktuře"
            className="px-1 md:px-4 md:pt-4 pt-2"
          >
            <dl className="space-y-3 text-left px-1 md:px-4">
              <div className="text-sm font-medium text-gray-500">
                Číslo faktury:{" "}
                <span className="font-bold text-gray-900">
                  {invoice.invoice_number || "Bude přiděleno"}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-500">
                Datum vystavení: {formatDateCZ(invoice.issue_date)}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Datum splatnosti: {formatDateCZ(invoice.due_date)}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Datum úhrady:{" "}
                <span className="font-bold text-gray-900">
                  {invoice.payment_date
                    ? formatDateCZ(invoice.payment_date)
                    : "Nezaplaceno"}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-500">
                Měna:{" "}
                <span className="font-bold text-gray-900">
                  {invoice.currency}
                </span>
              </div>
            </dl>
          </Card>

          <Card
            title="Informace o klientovi"
            className="px-1 md:px-4 md:pt-4 pt-2"
          >
            <dl className="space-y-3 text-left px-1 md:px-4">
              <div className="text-sm font-medium text-gray-500">
                Název:{" "}
                <span className="font-bold text-gray-900">
                  {invoice.clients?.name}
                </span>
              </div>

              {invoice.clients?.company_id && (
                <div className="text-sm font-medium text-gray-500">
                  IČO:{" "}
                  <span className="font-bold text-gray-900">
                    {invoice.clients.company_id}
                  </span>
                </div>
              )}
              {invoice.clients?.vat_number && (
                <div className="text-sm font-medium text-gray-500">
                  DIČ:{" "}
                  <span className="font-bold text-gray-900">
                    {invoice.clients.vat_number}
                  </span>
                </div>
              )}
              {invoice.clients?.address && (
                <div className="text-sm font-medium text-gray-500">
                  Adresa:{" "}
                  <span className="font-bold text-gray-900">
                    {invoice.clients.address.street}{" "}
                    {invoice.clients.address.house_number},{" "}
                    {invoice.clients.address.city} {invoice.clients.address.zip}
                    , {invoice.clients.address.country}
                  </span>
                </div>
              )}
              {invoice.clients?.contact_email && (
                <div className="text-sm font-medium text-gray-500">
                  Email:{" "}
                  <span className="font-bold text-gray-900">
                    {invoice.clients.contact_email}
                  </span>
                </div>
              )}
              {invoice.clients?.contact_phone && (
                <div className="text-sm font-medium text-gray-500">
                  Telefon:{" "}
                  <span className="font-bold text-gray-900">
                    {invoice.clients.contact_phone}
                  </span>
                </div>
              )}
            </dl>
            {invoice.clients?.note && (
              <div className="text-sm font-light text-gray-500 border-1 border-gray-300 rounded-md p-1 mt-4 text-left">
                Poznámka: {invoice.clients.note}
              </div>
            )}
          </Card>
        </div>

        {/* Invoice Items */}
        <Card title="Položky faktury" className="px-1 md:px-4 md:pt-4 pt-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Popis
                  </th>
                  {showQuantityColumn && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Množství
                    </th>
                  )}
                  {showUnitColumn && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Jedn.
                    </th>
                  )}
                  {showUnitPriceColumn && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Cena/jedn.
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Celkem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm text-gray-500 text-left">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-left">
                      <div>{item.description}</div>
                      {!showQuantityColumn &&
                        !showUnitColumn &&
                        item.unit_id &&
                        unitLookup[item.unit_id]?.abbreviation && (
                          <div className="text-xs text-gray-500">
                            Jednotka: {unitLookup[item.unit_id].abbreviation}
                          </div>
                        )}
                    </td>
                    {showQuantityColumn && (
                      <td className="px-4 py-4 text-sm text-right text-gray-900">
                        {item.quantity !== null && item.quantity !== undefined
                          ? formatNumber(
                              item.quantity,
                              item.unit_id < 3 ? 0 : 3
                            )
                          : "-"}
                        {item.unit_id &&
                          unitLookup[item.unit_id]?.abbreviation &&
                          ` ${unitLookup[item.unit_id].abbreviation}`}
                      </td>
                    )}
                    {showUnitColumn && (
                      <td className="px-4 py-4 text-sm text-right text-gray-900">
                        {item.unit_id && unitLookup[item.unit_id]
                          ? unitLookup[item.unit_id].abbreviation
                          : "-"}
                      </td>
                    )}
                    {showUnitPriceColumn && (
                      <td className="px-4 py-4 text-sm text-right text-gray-900">
                        {item.unit_price !== null &&
                        item.unit_price !== undefined &&
                        item.unit_price !== "" &&
                        Number(item.unit_price) !== 0
                          ? formatCurrency(item.unit_price, invoice.currency)
                          : "-"}
                      </td>
                    )}
                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">
                      {item.quantity !== null &&
                      item.quantity !== undefined &&
                      item.unit_price !== null &&
                      item.unit_price !== undefined &&
                      item.unit_price !== "" &&
                      Number(item.unit_price) !== 0
                        ? formatCurrency(
                            item.quantity * item.unit_price,
                            invoice.currency
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan={totalLabelColSpan}
                    className="px-4 py-4 text-right text-base font-bold text-gray-900"
                  >
                    Celkem k úhradě:
                  </td>
                  <td className="px-4 py-4 text-right text-xl font-bold text-gray-900">
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Note */}
        {invoice.note && (
          <Card title="Poznámka" className="px-1 md:px-4 md:pt-4 pt-2">
            <p className="text-sm text-gray-700 whitespace-pre-wrap px-1 md:px-4 text-left">
              {invoice.note}
            </p>
          </Card>
        )}

        {/* Actions */}
        <Card title="Akce" className="px-1 md:px-4 md:pt-4 pt-2">
          <div className="flex flex-wrap gap-4 text-left">
            <DuplicateInvoiceButtonWrapper invoiceId={invoice.id} />
            {invoice.status_id === 1 && (
              <>
                <Link href={`/invoices/${invoice.id}/edit`}>
                  <Button variant="secondary">✏️ Upravit fakturu</Button>
                </Link>
                <form action="/api/invoices/update-status" method="POST">
                  <input type="hidden" name="invoice_id" value={invoice.id} />
                  <input type="hidden" name="status_id" value="2" />
                  <Button type="submit" variant="primary">
                    📤 Označit jako odeslanou
                  </Button>
                </form>
              </>
            )}

            {(invoice.status_id === 2 ||
              invoice.status_id === 5 ||
              invoice.status_id === 6) &&
              !invoice.is_paid && (
                <>
                  <form action="/api/invoices/mark-paid" method="POST">
                    <input type="hidden" name="invoice_id" value={invoice.id} />
                    <Button type="submit" variant="success">
                      ✓ Označit jako zaplacenou
                    </Button>
                  </form>
                  {invoice.status_id === 2 && (
                    <form action="/api/invoices/update-status" method="POST">
                      <input type="hidden" name="invoice_id" value={invoice.id} />
                      <input type="hidden" name="status_id" value="1" />
                      <Button type="submit" variant="secondary">
                        ↩ Vrátit do konceptu
                      </Button>
                    </form>
                  )}
                </>
              )}

            {invoice.is_paid && (
              <form action="/api/invoices/mark-unpaid" method="POST">
                <input type="hidden" name="invoice_id" value={invoice.id} />
                <Button type="submit" variant="secondary">
                  ↩ Zrušit zaplacení
                </Button>
              </form>
            )}

            {!invoice.is_canceled && invoice.status_id !== 3 && (
              <form action="/api/invoices/cancel" method="POST">
                <input type="hidden" name="invoice_id" value={invoice.id} />
                <Button type="submit" variant="danger">
                  ✕ Stornovat fakturu
                </Button>
              </form>
            )}

            <Link href={`/invoices/${invoice.id}/print`} target="_blank">
              <Button variant="outline">🖨️ Tisknout / PDF</Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
