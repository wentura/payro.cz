/**
 * Invoices API Route
 *
 * Handles CRUD operations for invoices
 */

import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { createInvoiceWithItems } from "@/app/lib/services/InvoiceService";
import { canUserCreateInvoice } from "@/app/lib/services/SubscriptionService";
import { NextResponse } from "next/server";

/**
 * POST - Create new invoice with items
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      client_id,
      issue_date,
      due_term_id,
      payment_type_id,
      currency,
      note,
      items,
    } = body;

    // Check subscription limits before creating invoice
    const canCreate = await canUserCreateInvoice(user.id);

    if (!canCreate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Dosáhli jste měsíčního limitu faktur. Upgradujte svůj plán pro vytvoření dalších faktur.",
          errorCode: "INVOICE_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    // Create invoice using service
    const result = await createInvoiceWithItems(
      {
        client_id,
        issue_date,
        due_term_id,
        payment_type_id,
        currency,
        note,
      },
      items,
      user.id
    );

    if (result.success) {
      await logAuditEvent({
        userId: user.id,
        action: "invoice.created",
        entityType: "invoice",
        entityId: result.data?.invoice?.id || null,
        request,
      });
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 500 }
      );
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Chyba při vytváření faktury" },
      { status: 500 }
    );
  }
}
