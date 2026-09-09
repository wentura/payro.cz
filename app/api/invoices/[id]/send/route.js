/**
 * Send Invoice Email API
 *
 * Marks draft as sent (to assign invoice number), generates PDF, emails via Resend.
 * GET returns the PDF for download.
 */

import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { parseWithSchema } from "@/app/lib/api-validation";
import {
  buildInvoiceEmailContent,
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
import { supabase } from "@/app/lib/supabase";
import { invoiceSendSchema } from "@/app/lib/validations";
import { NextResponse } from "next/server";

async function markDraftAsSent(invoiceId, userId) {
  const { error } = await supabase
    .from("invoices")
    .update({ status_id: 2 })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .eq("status_id", 1)
    .select("*")
    .single();

  if (error) {
    console.error("Error marking invoice as sent before email:", error);
    return { success: false, error: "Chyba při označení faktury jako odeslané" };
  }

  return { success: true };
}

/**
 * GET - download invoice PDF
 */
export async function GET(_request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const [invoice, issuer, units] = await Promise.all([
      loadInvoiceForEmail(id, user.id),
      loadIssuerForEmail(user.id),
      getUnits(),
    ]);

    if (!invoice || !issuer) {
      return NextResponse.json(
        { success: false, error: "Faktura nenalezena" },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateInvoicePdfBuffer({
      invoice,
      issuer,
      units,
    });

    const filename = getInvoicePdfFilename(invoice.invoice_number);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/invoices/[id]/send:", error);
    return NextResponse.json(
      { success: false, error: "Chyba při generování PDF" },
      { status: 500 }
    );
  }
}

/**
 * POST - send invoice email with PDF
 */
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
      key: `invoice:send:${user.id}:${ip}`,
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

    let invoice = await loadInvoiceForEmail(id, user.id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Faktura nenalezena" },
        { status: 404 }
      );
    }

    const issuer = await loadIssuerForEmail(user.id);
    if (!issuer) {
      return NextResponse.json(
        { success: false, error: "Profil uživatele nenalezen" },
        { status: 500 }
      );
    }

    if (invoice.status_id === 1) {
      const markResult = await markDraftAsSent(id, user.id);
      if (!markResult.success) {
        return NextResponse.json(
          { success: false, error: markResult.error },
          { status: 500 }
        );
      }

      invoice = await loadInvoiceForEmail(id, user.id);
      if (!invoice) {
        return NextResponse.json(
          {
            success: false,
            error: "Faktura nenalezena po označení jako odeslaná",
          },
          { status: 500 }
        );
      }
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
      console.error("PDF generation failed:", pdfError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Faktura byla označena jako odeslaná, ale PDF se nepodařilo vygenerovat. Zkuste odeslání znovu.",
        },
        { status: 500 }
      );
    }

    const filename = getInvoicePdfFilename(invoice.invoice_number);
    const { subject, html, text } = buildInvoiceEmailContent({
      invoice,
      issuer,
      kind: "invoice",
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
            "Faktura je odeslaná, ale email se nepodařilo doručit. Zkuste to znovu.",
        },
        { status: emailResult.status || 502 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "invoice.email_sent",
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
      message: "Faktura byla odeslána e-mailem",
      data: {
        invoiceNumber: invoice.invoice_number,
        statusId: invoice.status_id,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/invoices/[id]/send:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba při odesílání faktury" },
      { status: 500 }
    );
  }
}
