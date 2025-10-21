import PaymentQRCode from "@/app/components/PaymentQRCode";
import { getCurrentUser } from "@/app/lib/auth";
import { generateInvoiceSPAYD } from "@/app/lib/payment-qr";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency, formatDateCZ, formatNumber } from "@/app/lib/utils";
import { redirect } from "next/navigation";
import PrintButton from "./PrintButton";

/**
 * Invoice Print Page
 *
 * Clean print-friendly view of invoice
 */

async function getInvoice(invoiceId, userId) {
  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        clients!inner(*)
      `
      )
      .eq("id", invoiceId)
      .eq("user_id", userId)
      .single();

    if (invoiceError || !invoice) {
      return null;
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("order_number", { ascending: true });

    if (itemsError) {
      return { ...invoice, items: [] };
    }

    return { ...invoice, items: items || [] };
  } catch (error) {
    return null;
  }
}

async function getUser(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

async function getUnits() {
  try {
    const { data, error } = await supabase.from("units").select("*");
    if (error) return [];
    return data || [];
  } catch (error) {
    return [];
  }
}

export default async function InvoicePrintPage({ params }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const invoice = await getInvoice(params.id, currentUser.id);
  const issuer = await getUser(currentUser.id);
  const units = await getUnits();

  if (!invoice) {
    return <div>Faktura nenalezena</div>;
  }

  const unitLookup = units.reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {});

  const issuerBilling =
    typeof issuer?.billing_details === "string"
      ? JSON.parse(issuer.billing_details)
      : issuer?.billing_details || {};

  const clientAddress =
    typeof invoice.clients?.address === "string"
      ? JSON.parse(invoice.clients.address)
      : invoice.clients?.address || {};

  // Get payment type name
  const getPaymentTypeName = (paymentTypeId) => {
    const types = {
      1: "Bankovní převod",
      2: "Hotovost",
      3: "Kreditní karta",
      4: "Jiný",
    };
    return types[paymentTypeId] || "-";
  };

  // Generate SPAYD string for QR code
  const spaydString = generateInvoiceSPAYD(invoice, issuer);

  return (
    <div>
      <PrintButton />
      <div className="w-full max-w-4xl mx-auto p-8 bg-white min-h-screen print:p-0 print:max-w-none invoice-print flex flex-col justify-between">
        {/* Swiss Grid Header - Invoice Number + Title */}
        <div>
          <div className="mb-6 pb-3 border-b-2 border-gray-400">
            <h1 className="text-3xl font-bold text-gray-700 uppercase tracking-tight flex justify-between items-center">
              <div>FAKTURA {invoice.invoice_number || "KONCEPT"}</div>
              <div>{issuer?.name}</div>{" "}
            </h1>
          </div>

          {/* Grid Layout - Issuer & Client Side by Side */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Issuer (Dodavatel) */}
            <div>
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 pb-1 border-b border-gray-400">
                DODAVATEL
              </h2>
              <div className="text-xs leading-snug">
                <p className="font-bold text-gray-700 mb-0.5">{issuer?.name}</p>
                {issuer?.company_id && (
                  <p className="text-gray-700">IČO: {issuer.company_id}</p>
                )}
                {issuerBilling.street && (
                  <p className="text-gray-700">
                    {issuerBilling.street} {issuerBilling.house_number}
                  </p>
                )}
                {issuerBilling.city && (
                  <p className="text-gray-700">
                    {issuerBilling.zip} {issuerBilling.city}
                  </p>
                )}
                {issuerBilling.country && (
                  <p className="text-gray-700">{issuerBilling.country}</p>
                )}
              </div>
            </div>

            {/* Client (Odběratel) */}
            <div>
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 pb-1 border-b border-gray-400">
                ODBĚRATEL
              </h2>
              <div className="text-xs leading-snug">
                <p className="font-bold text-gray-700 mb-0.5">
                  {invoice.clients?.name}
                </p>
                {invoice.clients?.company_id && (
                  <p className="text-gray-700">
                    IČO: {invoice.clients.company_id}
                  </p>
                )}
                {invoice.clients?.vat_number && (
                  <p className="text-gray-700">
                    DIČ: {invoice.clients.vat_number}
                  </p>
                )}
                {clientAddress.street && (
                  <p className="text-gray-700">
                    {clientAddress.street} {clientAddress.house_number}
                  </p>
                )}
                {clientAddress.city && (
                  <p className="text-gray-700">
                    {clientAddress.zip} {clientAddress.city}
                  </p>
                )}
                {clientAddress.country && (
                  <p className="text-gray-700">{clientAddress.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Metadata - Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b border-gray-400">
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                Datum vystavení
              </p>
              <p className="text-xs font-medium text-gray-700">
                {formatDateCZ(invoice.issue_date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                Datum splatnosti
              </p>
              <p className="text-xs font-medium text-gray-700">
                {formatDateCZ(invoice.due_date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                Způsob platby
              </p>
              <p className="text-xs font-medium text-gray-700">
                {getPaymentTypeName(invoice.payment_type_id)}
              </p>
            </div>
            {invoice.payment_date && (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                    Datum úhrady
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {formatDateCZ(invoice.payment_date)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Items Table - Clean Swiss Grid */}
          <div className="mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-2/5">
                    Popis položky
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-1/6">
                    Množství
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">
                    Jedn.
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-1/6">
                    Cena/jedn.
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-1/6">
                    Celkem
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-400">
                    <td className="px-2 py-2 text-xs text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-2 py-2 text-xs text-right text-gray-700">
                      {formatNumber(item.quantity, 3)}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-gray-700">
                      {item.unit_id && unitLookup[item.unit_id]
                        ? unitLookup[item.unit_id].abbreviation
                        : "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-right text-gray-700">
                      {formatCurrency(item.unit_price, invoice.currency)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-bold text-gray-700">
                      {formatCurrency(
                        item.quantity * item.unit_price,
                        invoice.currency
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-400">
                  <td
                    colSpan="4"
                    className="px-2 py-3 text-right text-sm font-bold text-gray-700 uppercase"
                  >
                    Celkem k úhradě:
                  </td>
                  <td className="px-2 py-3 text-right text-lg font-bold text-gray-700">
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Note */}
          {invoice.note && (
            <div className="my-12">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Poznámka
              </h3>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">
                {invoice.note}
              </p>
            </div>
          )}

          {/* Bank Account and QR Code */}
          {issuer?.bank_account && (
            <div className="">
              <div className="grid grid-cols-2 gap-6">
                {/* Payment Details */}
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Platební údaje
                  </h3>
                  <p className="text-xs text-gray-700 mb-1">
                    <span className="font-bold">Číslo účtu:</span>{" "}
                    {issuer.bank_account}
                  </p>
                  <p className="text-xs text-gray-700 mb-1">
                    <span className="font-bold">Variabilní symbol:</span>{" "}
                    {invoice.invoice_number?.replace(/[^0-9]/g, "") || "-"}
                  </p>
                  <p className="text-xs text-gray-700 mb-1">
                    <span className="font-bold">Částka:</span>{" "}
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-end">
                  <PaymentQRCode spaydString={spaydString} size={120} />
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer - Generated by */}
        <div>
          <div className="mt-4 pt-2 border-t border-gray-400">
            <p className="text-xs text-gray-700 text-center">
              {issuer?.name} vygeneroval fakturu v aplikaci www.fktr.cz
            </p>
          </div>

          {/* Print Instructions */}
          <div className="mt-6 mb-8 p-3 border-2 border-gray-400 print:hidden">
            <p className="text-sm text-gray-700 text-center font-medium">
              🖨️ Stiskněte Ctrl+P (Cmd+P na Mac) pro tisk nebo uložení jako PDF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
