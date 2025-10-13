/**
 * Single Invoice API Route
 *
 * Handles GET and PUT for a single invoice
 */

import { getCurrentUser } from "@/app/lib/auth";
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

    // Validate required fields
    if (!client_id || !issue_date) {
      return NextResponse.json(
        { success: false, error: "Klient a datum vystavení jsou povinné" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Faktura musí obsahovat alespoň jednu položku",
        },
        { status: 400 }
      );
    }

    // Calculate due date if due_term_id is provided
    let dueDate = null;
    if (due_term_id) {
      const { data: dueTerm } = await supabase
        .from("due_terms")
        .select("days_count")
        .eq("id", due_term_id)
        .single();

      if (dueTerm) {
        const issueDateTime = new Date(issue_date);
        issueDateTime.setDate(issueDateTime.getDate() + dueTerm.days_count);
        dueDate = issueDateTime.toISOString().split("T")[0];
      }
    }

    // Calculate total from items
    const totalAmount = items.reduce((sum, item) => {
      return sum + parseFloat(item.quantity) * parseFloat(item.unit_price);
    }, 0);

    // Update invoice
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        client_id,
        issue_date,
        due_date: dueDate,
        due_term_id: due_term_id || null,
        payment_type_id: payment_type_id || null,
        currency: currency || "CZK",
        total_amount: totalAmount,
        note: note || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating invoice:", updateError);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci faktury" },
        { status: 500 }
      );
    }

    // Delete all existing items
    await supabase.from("invoice_items").delete().eq("invoice_id", id);

    // Insert new items
    const itemsToInsert = items.map((item, index) => ({
      invoice_id: id,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unit_id: item.unit_id || null,
      unit_price: parseFloat(item.unit_price),
      order_number: index + 1,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error updating invoice items:", itemsError);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci položek faktury" },
        { status: 500 }
      );
    }

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
