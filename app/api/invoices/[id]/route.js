/**
 * Single Invoice API Route
 *
 * Handles GET and PUT for a single invoice
 */

import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { updateInvoiceWithItems } from "@/app/lib/services/InvoiceService";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET single invoice with items
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { success: false, error: "Faktura nenalezena" },
        { status: 404 }
      );
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("order_number", { ascending: true });

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return NextResponse.json(
        { success: false, error: "Chyba při načítání položek" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        items: items || [],
      },
    });
  } catch (error) {
    console.error("Error in GET /api/invoices/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update invoice (only for drafts)
 */
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const { id } = await params;

    const body = await request.json();
    const {
      client_id,
      issue_date,
      due_term_id,
      payment_type_id,
      currency,
      note,
      is_small_buyer,
      items,
    } = body;

    // Validate invoice exists and is a draft
    const { data: existingInvoice, error: checkError } = await supabase
      .from("invoices")
      .select("status_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingInvoice) {
      return NextResponse.json(
        { success: false, error: "Faktura nenalezena" },
        { status: 404 }
      );
    }

    if (existingInvoice.status_id !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Lze upravovat pouze faktury ve stavu Koncept",
        },
        { status: 400 }
      );
    }

    const result = await updateInvoiceWithItems(
      id,
      {
        client_id,
        issue_date,
        due_term_id,
        payment_type_id,
        currency,
        note,
        is_small_buyer: Boolean(is_small_buyer),
      },
      items,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 500 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "invoice.updated",
      entityType: "invoice",
      entityId: id,
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Faktura byla úspěšně aktualizována",
    });
  } catch (error) {
    console.error("Error in PUT /api/invoices/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
