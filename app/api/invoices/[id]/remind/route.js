/**
 * Send Payment Reminder API
 *
 * Manual reminder email with the same invoice PDF attachment.
 */

import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { parseWithSchema } from "@/app/lib/api-validation";
import {
  buildInvoiceEmailContent,
  canSendPaymentReminder,
  loadInvoiceForEmail,
  loadIssuerForEmail,
} from "@/app/lib/invoice-email";
import {
  generateInvoicePdfBuffer,
  getInvoicePdfFilename,
} from "@/app/lib/invoice-pdf";
import { isEmailConfigured, sendInvoiceEmail } from "@/app/lib/email";
import { getRequestIp, rateLimit } from "@/app/lib/rate-limit";
import { getUnits } from "@/app/lib/services/getReferenceData";
import { invoiceSendSchema } from "@/app/lib/validations";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Email služba není nakonfigurována. Kontaktujte administrátora.",
        },
        { status: 503 }
      );
    }

    const ip = getRequestIp(request);
    const rate = await rateLimit({
      key: `invoice:remind:${user.id}:${ip}`,
      limit: 20,
      windowSeconds: 3600,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Příliš mnoho odeslání. Zkuste to později." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const parsed = parseWithSchema(invoiceSendSchema, await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const { to, ccSelf } = parsed.data;

    const invoice = await loadInvoiceForEmail(id, user.id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Faktura nenalezena" },
        { status: 404 }
      );
    }

    if (!canSendPaymentReminder(invoice)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Upomínku lze poslat jen u nezaplacené odeslané faktury (ne u konceptu ani stornované).",
        },
        { status: 400 }
      );
    }

    const issuer = await loadIssuerForEmail(user.id);
    if (!issuer) {
      return NextResponse.json(
        { success: false, error: "Profil uživatele nenalezen" },
        { status: 500 }
      );
    }

    const units = await getUnits();
    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePdfBuffer({
        invoice,
        issuer,
        units,
      });
    } catch (pdfError) {
      console.error("PDF generation failed for reminder:", pdfError);
      return NextResponse.json(
        { success: false, error: "Chyba při generování PDF. Zkuste to znovu." },
        { status: 500 }
      );
    }

    const filename = getInvoicePdfFilename(invoice.invoice_number);
    const { subject, html, text } = buildInvoiceEmailContent({
      invoice,
      issuer,
      kind: "reminder",
    });

    const cc =
      ccSelf && issuer.contact_email && issuer.contact_email !== to
        ? issuer.contact_email
        : null;

    const emailResult = await sendInvoiceEmail({
      to,
      cc,
      subject,
      html,
      text,
      pdfBuffer,
      filename,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            emailResult.error ||
            "Upomínku se nepodařilo odeslat. Zkuste to znovu.",
        },
        { status: emailResult.status || 502 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "invoice.reminder_sent",
      entityType: "invoice",
      entityId: id,
      metadata: {
        to,
        ccSelf: Boolean(ccSelf),
        invoiceNumber: invoice.invoice_number,
        messageId: emailResult.messageId || null,
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Upomínka byla odeslána e-mailem",
      data: {
        invoiceNumber: invoice.invoice_number,
        statusId: invoice.status_id,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/invoices/[id]/remind:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba při odesílání upomínky" },
      { status: 500 }
    );
  }
}
