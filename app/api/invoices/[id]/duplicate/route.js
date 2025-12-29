/**
 * Duplicate Invoice API Route
 *
 * Creates a draft copy of an existing invoice
 */

import { getCurrentUser } from "@/app/lib/auth";
import { createInvoiceWithItems } from "@/app/lib/services/InvoiceService";
import { canUserCreateInvoice } from "@/app/lib/services/SubscriptionService";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * POST - Duplicate invoice as draft
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

    // Await params in Next.js 16
    const { id } = await params;

    // Get original invoice with items
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
      console.error("Error fetching invoice items:", itemsError);
      return NextResponse.json(
        { success: false, error: "Chyba při načítání položek faktury" },
        { status: 500 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Faktura nemá žádné položky k duplikaci" },
        { status: 400 }
      );
    }

    // Check subscription limits before creating duplicate
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

    // Prepare invoice data for duplicate (without invoice_number, payment_date, etc.)
    const invoiceData = {
      client_id: invoice.client_id,
      issue_date: invoice.issue_date || new Date().toISOString().split("T")[0],
      due_term_id: invoice.due_term_id,
      payment_type_id: invoice.payment_type_id,
      currency: invoice.currency || "CZK",
      note: invoice.note,
    };

    // Prepare items for duplicate
    const itemsForDuplicate = items.map((item) => ({
      description: item.description,
      quantity: parseFloat(item.quantity || 0),
      unit_id: item.unit_id,
      unit_price: parseFloat(item.unit_price || 0),
    }));

    // Create duplicate invoice using service
    const result = await createInvoiceWithItems(
      invoiceData,
      itemsForDuplicate,
      user.id
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          invoiceId: result.data.invoice.id,
          message: "Faktura byla úspěšně duplikována",
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 500 }
      );
    }
  } catch (error) {
    console.error("Error duplicating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Chyba při duplikaci faktury" },
      { status: 500 }
    );
  }
}

