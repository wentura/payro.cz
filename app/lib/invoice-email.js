/**
 * Shared helpers for invoice / reminder emails
 */

import { formatCurrency, formatDateCZ } from "@/app/lib/utils";
import { supabase } from "@/app/lib/supabase";
import { USER_PUBLIC_COLUMNS } from "@/app/lib/user-public";

/**
 * Whether a manual payment reminder can be sent for this invoice.
 * Sent / overdue / partial unpaid — not draft, paid, or canceled.
 */
export function canSendPaymentReminder(invoice) {
  if (!invoice) return false;
  if (invoice.is_canceled || invoice.status_id === 4) return false;
  if (invoice.is_paid || invoice.status_id === 3) return false;
  if (invoice.status_id === 1) return false;
  return [2, 5, 6].includes(Number(invoice.status_id));
}

export async function loadInvoiceForEmail(invoiceId, userId) {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      clients(*)
    `
    )
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .single();

  if (error || !invoice) {
    return null;
  }

  if (invoice.status_id === 4 || invoice.is_canceled) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("order_number", { ascending: true });

  if (itemsError) {
    console.error("Error loading invoice items for email:", itemsError);
  }

  return { ...invoice, items: items || [] };
}

export async function loadIssuerForEmail(userId) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_PUBLIC_COLUMNS)
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

function daysOverdue(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/**
 * Build email subject/body for invoice or reminder
 * @param {"invoice"|"reminder"} kind
 */
export function buildInvoiceEmailContent({ invoice, issuer, kind = "invoice" }) {
  const number = invoice.invoice_number || "bez čísla";
  const amount = formatCurrency(invoice.total_amount, invoice.currency);
  const dueDate = formatDateCZ(invoice.due_date) || "-";
  const issuerName = issuer?.name || "Dodavatel";
  const clientName = invoice.clients?.name || "odběrateli";
  const overdue = daysOverdue(invoice.due_date);

  if (kind === "reminder") {
    const overdueLine =
      overdue > 0
        ? `<p style="color:#b91c1c;"><strong>Faktura je ${overdue} ${
            overdue === 1 ? "den" : overdue < 5 ? "dny" : "dní"
          } po splatnosti.</strong></p>`
        : `<p>Připomínáme splatnost faktury <strong>${dueDate}</strong>.</p>`;

    const overdueText =
      overdue > 0
        ? `Faktura je ${overdue} dní po splatnosti.`
        : `Připomínáme splatnost faktury ${dueDate}.`;

    const subject = `Upomínka: faktura ${number} — ${issuerName}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h1 style="color: #111; margin-top: 0; font-size: 20px;">Upomínka k faktuře ${number}</h1>
        <p>Dobrý den,</p>
        <p>
          dovolujeme si připomenout nezaplacenou fakturu <strong>${number}</strong>
          od <strong>${issuerName}</strong>${
            invoice.clients?.name ? ` pro ${clientName}` : ""
          }.
        </p>
        ${overdueLine}
        <p>
          <strong>Částka:</strong> ${amount}<br>
          <strong>Splatnost:</strong> ${dueDate}
        </p>
        <p>PDF faktury najdete znovu v příloze tohoto emailu.</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          S pozdravem,<br>
          ${issuerName}
        </p>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">
        <p>Odesláno přes <a href="https://www.fktr.cz" style="color: #666;">FKTR.cz</a></p>
      </div>
    </body>
    </html>
  `;

    const text = `
Upomínka: faktura ${number}

Dobrý den,

dovolujeme si připomenout nezaplacenou fakturu ${number} od ${issuerName}${
      invoice.clients?.name ? ` pro ${clientName}` : ""
    }.

${overdueText}

Částka: ${amount}
Splatnost: ${dueDate}

PDF faktury je v příloze tohoto emailu.

S pozdravem,
${issuerName}

---
Odesláno přes FKTR.cz
  `.trim();

    return { subject, html, text };
  }

  const subject = `Faktura ${number} — ${issuerName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h1 style="color: #111; margin-top: 0; font-size: 20px;">Faktura ${number}</h1>
        <p>Dobrý den,</p>
        <p>
          zasíláme fakturu <strong>${number}</strong> od <strong>${issuerName}</strong>
          ${invoice.clients?.name ? ` pro ${clientName}` : ""}.
        </p>
        <p>
          <strong>Částka:</strong> ${amount}<br>
          <strong>Splatnost:</strong> ${dueDate}
        </p>
        <p>PDF faktury najdete v příloze tohoto emailu.</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          S pozdravem,<br>
          ${issuerName}
        </p>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">
        <p>Odesláno přes <a href="https://www.fktr.cz" style="color: #666;">FKTR.cz</a></p>
      </div>
    </body>
    </html>
  `;

  const text = `
Faktura ${number}

Dobrý den,

zasíláme fakturu ${number} od ${issuerName}${
    invoice.clients?.name ? ` pro ${clientName}` : ""
  }.

Částka: ${amount}
Splatnost: ${dueDate}

PDF faktury je v příloze tohoto emailu.

S pozdravem,
${issuerName}

---
Odesláno přes FKTR.cz
  `.trim();

  return { subject, html, text };
}
