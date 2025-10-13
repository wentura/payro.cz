/**
 * Mark Invoice as Paid API Route
 */

import { getCurrentUser } from "@/app/lib/auth";
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

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "ID faktury je povinné" },
        { status: 400 }
      );
    }

    // Update invoice
    const { error } = await supabase
      .from("invoices")
      .update({
        payment_date: new Date().toISOString().split("T")[0],
        is_paid: true,
        status_id: 3, // Paid
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking invoice as paid:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při označování faktury jako zaplacené",
        },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL(`/invoices/${invoiceId}`, request.url)
    );
  } catch (error) {
    console.error("Error in POST /api/invoices/mark-paid:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
