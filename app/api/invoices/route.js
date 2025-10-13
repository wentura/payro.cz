/**
 * Invoices API Route
 *
 * Handles CRUD operations for invoices
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
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

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        client_id,
        issue_date,
        due_date: dueDate,
        due_term_id: due_term_id || null,
        payment_type_id: payment_type_id || null,
        currency: currency || "CZK",
        total_amount: totalAmount,
        note: note || null,
        status_id: 1, // Draft
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json(
        { success: false, error: "Chyba při vytváření faktury" },
        { status: 500 }
      );
    }

    // Insert invoice items
    const itemsToInsert = items.map((item, index) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unit_id: item.unit_id || null,
      unit_price: parseFloat(item.unit_price),
      order_number: item.order_number || index + 1,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      // Rollback: delete the invoice
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json(
        { success: false, error: "Chyba při vytváření položek faktury" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error in POST /api/invoices:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
