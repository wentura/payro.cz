/**
 * Invoice Service
 *
 * Business logic for invoice operations
 */

import { supabase } from "@/app/lib/supabase";
import { incrementInvoiceUsage } from "./SubscriptionService";

/**
 * Create a new invoice with items
 * @param {Object} invoiceData - Invoice data
 * @param {Array} items - Invoice items
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export async function createInvoiceWithItems(invoiceData, items, userId) {
  try {
    // Validate required fields
    if (!invoiceData.client_id || !invoiceData.issue_date) {
      return {
        success: false,
        error: "Klient a datum vystavení jsou povinné",
        status: 400,
      };
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        error: "Faktura musí obsahovat alespoň jednu položku",
        status: 400,
      };
    }

    // Calculate due date if due_term_id is provided
    let dueDate = null;
    if (invoiceData.due_term_id) {
      const { data: dueTerm, error: dueTermError } = await supabase
        .from("due_terms")
        .select("days_count")
        .eq("id", invoiceData.due_term_id)
        .single();

      if (dueTermError) {
        console.error("Error fetching due term:", dueTermError);
        return {
          success: false,
          error: "Chyba při získávání splatnosti",
          status: 500,
        };
      }

      dueDate = new Date(invoiceData.issue_date);
      dueDate.setDate(dueDate.getDate() + dueTerm.days_count);
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) =>
        sum + parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
      0
    );

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: invoiceData.client_id,
        issue_date: invoiceData.issue_date,
        due_date: dueDate?.toISOString().split("T")[0],
        payment_type_id: invoiceData.payment_type_id,
        due_term_id: invoiceData.due_term_id,
        currency: invoiceData.currency || "CZK",
        total_amount: totalAmount,
        note: invoiceData.note,
        status_id: 1, // Draft status
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return {
        success: false,
        error: "Chyba při vytváření faktury",
        status: 500,
      };
    }

    // Create invoice items
    const itemsWithInvoiceId = items.map((item, index) => ({
      invoice_id: invoice.id,
      order_number: index + 1,
      description: item.description,
      quantity: parseFloat(item.quantity || 0),
      unit_id: item.unit_id,
      unit_price: parseFloat(item.unit_price || 0),
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);

      // Clean up the invoice if items creation failed
      await supabase.from("invoices").delete().eq("id", invoice.id);

      return {
        success: false,
        error: "Chyba při vytváření položek faktury",
        status: 500,
      };
    }

    // Increment user's invoice usage
    await incrementInvoiceUsage(userId);

    return {
      success: true,
      data: {
        invoice,
        items: itemsWithInvoiceId,
        totalAmount,
      },
    };
  } catch (error) {
    console.error("Error in createInvoiceWithItems:", error);
    return {
      success: false,
      error: "Chyba při vytváření faktury",
      status: 500,
    };
  }
}

/**
 * Update invoice with items
 * @param {string} invoiceId - Invoice ID
 * @param {Object} invoiceData - Updated invoice data
 * @param {Array} items - Updated invoice items
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export async function updateInvoiceWithItems(
  invoiceId,
  invoiceData,
  items,
  userId
) {
  try {
    // Validate required fields
    if (!invoiceData.client_id || !invoiceData.issue_date) {
      return {
        success: false,
        error: "Klient a datum vystavení jsou povinné",
        status: 400,
      };
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        error: "Faktura musí obsahovat alespoň jednu položku",
        status: 400,
      };
    }

    // Calculate due date if due_term_id is provided
    let dueDate = null;
    if (invoiceData.due_term_id) {
      const { data: dueTerm, error: dueTermError } = await supabase
        .from("due_terms")
        .select("days_count")
        .eq("id", invoiceData.due_term_id)
        .single();

      if (dueTermError) {
        console.error("Error fetching due term:", dueTermError);
        return {
          success: false,
          error: "Chyba při získávání splatnosti",
          status: 500,
        };
      }

      dueDate = new Date(invoiceData.issue_date);
      dueDate.setDate(dueDate.getDate() + dueTerm.days_count);
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) =>
        sum + parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
      0
    );

    // Update invoice
    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .update({
        client_id: invoiceData.client_id,
        issue_date: invoiceData.issue_date,
        due_date: dueDate?.toISOString().split("T")[0],
        payment_type_id: invoiceData.payment_type_id,
        due_term_id: invoiceData.due_term_id,
        currency: invoiceData.currency || "CZK",
        total_amount: totalAmount,
        note: invoiceData.note,
      })
      .eq("id", invoiceId)
      .eq("user_id", userId)
      .select()
      .single();

    if (invoiceError) {
      console.error("Error updating invoice:", invoiceError);
      return {
        success: false,
        error: "Chyba při aktualizaci faktury",
        status: 500,
      };
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoiceId);

    if (deleteError) {
      console.error("Error deleting invoice items:", deleteError);
      return {
        success: false,
        error: "Chyba při mazání položek faktury",
        status: 500,
      };
    }

    // Create new items
    const itemsWithInvoiceId = items.map((item, index) => ({
      invoice_id: invoiceId,
      order_number: index + 1,
      description: item.description,
      quantity: parseFloat(item.quantity || 0),
      unit_id: item.unit_id,
      unit_price: parseFloat(item.unit_price || 0),
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      return {
        success: false,
        error: "Chyba při vytváření položek faktury",
        status: 500,
      };
    }

    return {
      success: true,
      data: {
        invoice: updatedInvoice,
        items: itemsWithInvoiceId,
        totalAmount,
      },
    };
  } catch (error) {
    console.error("Error in updateInvoiceWithItems:", error);
    return {
      success: false,
      error: "Chyba při aktualizaci faktury",
      status: 500,
    };
  }
}

/**
 * Get invoices with filters
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of invoices
 */
export async function getInvoicesWithFilters(userId, filters = {}) {
  try {
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        clients!inner(name, company_id),
        invoice_statuses!inner(name),
        payment_types!inner(name),
        due_terms!inner(name, days_count)
      `
      )
      .eq("user_id", userId)
      .eq("is_deleted", false);

    // Apply filters
    if (filters.status_id) {
      query = query.eq("status_id", filters.status_id);
    }

    if (filters.status_ids && Array.isArray(filters.status_ids)) {
      query = query.in("status_id", filters.status_ids);
    }

    if (filters.overdue) {
      const today = new Date().toISOString().split("T")[0];
      query = query.lt("due_date", today);
    }

    if (filters.client_id) {
      query = query.eq("client_id", filters.client_id);
    }

    if (filters.date_from) {
      query = query.gte("issue_date", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("issue_date", filters.date_to);
    }

    // Apply ordering
    const orderBy = filters.orderBy || "created_at";
    const orderDirection = filters.orderDirection || "desc";
    query = query.order(orderBy, { ascending: orderDirection === "asc" });

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }

    return invoices || [];
  } catch (error) {
    console.error("Error in getInvoicesWithFilters:", error);
    return [];
  }
}

/**
 * Get overdue invoices
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of overdue invoices
 */
export async function getOverdueInvoices(userId) {
  return getInvoicesWithFilters(userId, {
    status_ids: [1, 2], // Draft and Sent statuses
    overdue: true,
    orderBy: "due_date",
    orderDirection: "asc",
  });
}

/**
 * Calculate invoice statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getInvoiceStatistics(userId) {
  try {
    const invoices = await getInvoicesWithFilters(userId);

    const stats = {
      total: invoices.length,
      paid: invoices.filter((inv) => inv.status_id === 3).length,
      unpaid: invoices.filter((inv) => [1, 2].includes(inv.status_id)).length,
      canceled: invoices.filter((inv) => inv.status_id === 4).length,
      overdue: 0,
      totalRevenue: 0,
      unpaidAmount: 0,
    };

    // Calculate overdue invoices
    const today = new Date().toISOString().split("T")[0];
    stats.overdue = invoices.filter(
      (inv) =>
        [1, 2].includes(inv.status_id) && inv.due_date && inv.due_date < today
    ).length;

    // Calculate amounts
    stats.totalRevenue = invoices
      .filter((inv) => inv.status_id === 3)
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    stats.unpaidAmount = invoices
      .filter((inv) => [1, 2].includes(inv.status_id))
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    return stats;
  } catch (error) {
    console.error("Error in getInvoiceStatistics:", error);
    return {
      total: 0,
      paid: 0,
      unpaid: 0,
      canceled: 0,
      overdue: 0,
      totalRevenue: 0,
      unpaidAmount: 0,
    };
  }
}
