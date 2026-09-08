/**
 * Update Invoice Status API Route
 */

import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { isAllowedInvoiceStatusId } from "@/app/lib/invoice-status";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const body = await request.formData();
    const invoiceId = body.get("invoice_id");
    const statusId = body.get("status_id");

    if (!invoiceId || !statusId) {
      return NextResponse.json(
        { success: false, error: "ID faktury a status jsou povinné" },
        { status: 400 }
      );
    }

    if (!isAllowedInvoiceStatusId(statusId)) {
      return NextResponse.json(
        { success: false, error: "Neplatný status faktury" },
        { status: 400 }
      );
    }

    const parsedStatusId = parseInt(statusId, 10);

    const { data: existing, error: existingError } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { success: false, error: "Faktura nenalezena" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("invoices")
      .update({
        status_id: parsedStatusId,
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating invoice status:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci statusu faktury" },
        { status: 500 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "invoice.status_updated",
      entityType: "invoice",
      entityId: invoiceId,
      metadata: { statusId: parsedStatusId },
      request,
    });

    return NextResponse.redirect(
      new URL(`/invoices/${invoiceId}`, request.url)
    );
  } catch (error) {
    console.error("Error in POST /api/invoices/update-status:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
