/**
 * Cancel Invoice API Route
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
        is_canceled: true,
        status_id: 4, // Canceled
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error canceling invoice:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při stornování faktury" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL(`/invoices/${invoiceId}`, request.url)
    );
  } catch (error) {
    console.error("Error in POST /api/invoices/cancel:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
