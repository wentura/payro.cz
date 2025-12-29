/**
 * Activate Canceled Invoice API Route
 *
 * Reactivates a canceled invoice by checking invoice number collision
 * and setting appropriate status (draft if collision, sent if no collision)
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * POST - Activate canceled invoice
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

    // Get canceled invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status_id", 4) // Must be canceled
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        {
          success: false,
          error: "Faktura nenalezena nebo není zrušená",
        },
        { status: 404 }
      );
    }

    // Check if invoice has a valid invoice number
    if (!invoice.invoice_number) {
      // No invoice number - set as draft
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          status_id: 1, // Draft
          is_canceled: false,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error activating invoice:", updateError);
        return NextResponse.json(
          { success: false, error: "Chyba při aktivaci faktury" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Faktura byla aktivována jako koncept",
        data: { status_id: 1 },
      });
    }

    // Check for invoice number collision
    const { data: existingInvoice, error: checkError } = await supabase
      .from("invoices")
      .select("id, status_id")
      .eq("user_id", user.id)
      .eq("invoice_number", invoice.invoice_number)
      .neq("id", id) // Exclude current invoice
      .neq("status_id", 4) // Exclude other canceled invoices
      .neq("is_deleted", true)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking invoice number collision:", checkError);
      return NextResponse.json(
        { success: false, error: "Chyba při kontrole čísla faktury" },
        { status: 500 }
      );
    }

    // If collision exists, set as draft
    if (existingInvoice) {
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          status_id: 1, // Draft
          is_canceled: false,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error activating invoice:", updateError);
        return NextResponse.json(
          { success: false, error: "Chyba při aktivaci faktury" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Faktura byla aktivována jako koncept (kolize s číslem faktury)",
        data: { status_id: 1 },
      });
    }

    // No collision - reactivate as sent (status_id = 2)
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status_id: 2, // Sent
        is_canceled: false,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error activating invoice:", updateError);
      return NextResponse.json(
        { success: false, error: "Chyba při aktivaci faktury" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Faktura byla úspěšně aktivována",
      data: { status_id: 2 },
    });
  } catch (error) {
    console.error("Error activating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Chyba při aktivaci faktury" },
      { status: 500 }
    );
  }
}

