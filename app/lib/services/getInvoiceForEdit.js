/**
 * Get Invoice For Edit
 *
 * Server-side function to fetch invoice data for editing
 */

import { supabase } from "@/app/lib/supabase";

export async function getInvoiceForEdit(invoiceId, userId) {
  try {
    const [invoiceResult, itemsResult] = await Promise.all([
      supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("order_number", { ascending: true }),
    ]);

    const { data: invoice, error: invoiceError } = invoiceResult;

    if (invoiceError || !invoice) {
      return null;
    }

    // Check if invoice is in draft status
    if (invoice.status_id !== 1) {
      return { error: "Lze upravovat pouze faktury ve stavu Koncept" };
    }

    const { data: items, error: itemsError } = itemsResult;

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
      return { ...invoice, items: [] };
    }

    return { ...invoice, items: items || [] };
  } catch (error) {
    console.error("Error in getInvoiceForEdit:", error);
    return null;
  }
}

