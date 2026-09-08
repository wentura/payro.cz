/**
 * Invoice Service
 *
 * Business logic for invoice operations
 */

import { supabase } from "@/app/lib/supabase";
import { incrementInvoiceUsage } from "./SubscriptionService";
import { toNullableInt, toNullableUuid } from "@/app/lib/nullable-id";

const SMALL_BUYER_LIMIT = 10000;

function validateInvoiceRecipient(invoiceData, totalAmount) {
  const isSmallBuyer =
    invoiceData.is_small_buyer === true || !invoiceData.client_id;

  if (!invoiceData.issue_date) {
    return {
      success: false,
      error: "Datum vystavení je povinné",
      status: 400,
    };
  }

  if (!isSmallBuyer && !invoiceData.client_id) {
    return {
      success: false,
      error: "Klient je povinný",
      status: 400,
    };
  }

  if (isSmallBuyer) {
    if ((invoiceData.currency || "CZK") !== "CZK") {
      return {
        success: false,
        error: "Faktura pro malého odběratele musí být v měně CZK",
        status: 400,
      };
    }

    if (totalAmount > SMALL_BUYER_LIMIT) {
      return {
        success: false,
        error:
          "Faktura pro malého odběratele může mít maximálně 10 000 Kč včetně DPH.",
        status: 400,
      };
    }
  }

  return null;
}

async function ensureClientBelongsToUser(clientId, userId) {
  const { data: client, error } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", userId)
    .single();

  return !error && !!client;
}

/**
 * Create a new invoice with items
 * @param {Object} invoiceData - Invoice data
 * @param {Array} items - Invoice items
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export async function createInvoiceWithItems(invoiceData, items, userId) {
  try {
    if (!items || items.length === 0) {
      return {
        success: false,
        error: "Faktura musí obsahovat alespoň jednu položku",
        status: 400,
      };
    }

    const dueTermId = toNullableInt(invoiceData.due_term_id);
    const paymentTypeId = toNullableInt(invoiceData.payment_type_id);

    let dueDate = null;
    if (dueTermId) {
      const { data: dueTerm, error: dueTermError } = await supabase
        .from("due_terms")
        .select("days_count")
        .eq("id", dueTermId)
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
    const recipientValidationError = validateInvoiceRecipient(
      invoiceData,
      totalAmount
    );
    if (recipientValidationError) {
      return recipientValidationError;
    }
    const isSmallBuyer =
      invoiceData.is_small_buyer === true || !invoiceData.client_id;

    if (!isSmallBuyer) {
      const isClientOwnedByUser = await ensureClientBelongsToUser(
        invoiceData.client_id,
        userId
      );

      if (!isClientOwnedByUser) {
        return {
          success: false,
          error: "Vybraný klient nepatří přihlášenému uživateli",
          status: 403,
        };
      }
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: isSmallBuyer ? null : toNullableUuid(invoiceData.client_id),
        issue_date: invoiceData.issue_date,
        due_date: dueDate?.toISOString().split("T")[0],
        payment_type_id: paymentTypeId,
        due_term_id: dueTermId,
        currency: isSmallBuyer ? "CZK" : invoiceData.currency || "CZK",
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
      unit_id: toNullableInt(item.unit_id),
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
    if (!items || items.length === 0) {
      return {
        success: false,
        error: "Faktura musí obsahovat alespoň jednu položku",
        status: 400,
      };
    }

    const dueTermId = toNullableInt(invoiceData.due_term_id);
    const paymentTypeId = toNullableInt(invoiceData.payment_type_id);

    let dueDate = null;
    if (dueTermId) {
      const { data: dueTerm, error: dueTermError } = await supabase
        .from("due_terms")
        .select("days_count")
        .eq("id", dueTermId)
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
    const recipientValidationError = validateInvoiceRecipient(
      invoiceData,
      totalAmount
    );
    if (recipientValidationError) {
      return recipientValidationError;
    }
    const isSmallBuyer =
      invoiceData.is_small_buyer === true || !invoiceData.client_id;

    if (!isSmallBuyer) {
      const isClientOwnedByUser = await ensureClientBelongsToUser(
        invoiceData.client_id,
        userId
      );

      if (!isClientOwnedByUser) {
        return {
          success: false,
          error: "Vybraný klient nepatří přihlášenému uživateli",
          status: 403,
        };
      }
    }

    // Update invoice
    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .update({
        client_id: isSmallBuyer ? null : toNullableUuid(invoiceData.client_id),
        issue_date: invoiceData.issue_date,
        due_date: dueDate?.toISOString().split("T")[0],
        payment_type_id: paymentTypeId,
        due_term_id: dueTermId,
        currency: isSmallBuyer ? "CZK" : invoiceData.currency || "CZK",
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
      unit_id: toNullableInt(item.unit_id),
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
const INVOICE_LIST_SELECT = `
        id,
        invoice_number,
        issue_date,
        due_date,
        total_amount,
        currency,
        status_id,
        created_at,
        clients(name)
      `;

export const INVOICE_PAGE_SIZE = 50;

/**
 * Get invoices with filters and pagination
 */
export async function getInvoicesWithFilters(userId, filters = {}) {
  try {
    const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
    const pageSize = Math.max(
      1,
      Math.min(100, Number.parseInt(filters.limit, 10) || INVOICE_PAGE_SIZE)
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("invoices")
      .select(INVOICE_LIST_SELECT, { count: "exact" })
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (filters.status_id) {
      query = query.eq("status_id", filters.status_id);
    }

    if (filters.status_ids && Array.isArray(filters.status_ids)) {
      query = query.in("status_id", filters.status_ids);
    }

    if (filters.exclude_status_ids && Array.isArray(filters.exclude_status_ids)) {
      if (filters.exclude_status_ids.length === 1) {
        query = query.neq("status_id", filters.exclude_status_ids[0]);
      } else if (filters.exclude_status_ids.length > 1) {
        query = query.not(
          "status_id",
          "in",
          `(${filters.exclude_status_ids.join(",")})`
        );
      }
    }

    if (filters.overdue) {
      const today = new Date().toISOString().split("T")[0];
      query = query.lt("due_date", today).eq("is_paid", false).eq("is_canceled", false);
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

    const orderBy = filters.orderBy || "created_at";
    const orderDirection = filters.orderDirection || "desc";
    query = query.order(orderBy, { ascending: orderDirection === "asc" });
    query = query.range(from, to);

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return { invoices: [], total: 0, page, pageSize };
    }

    return {
      invoices: invoices || [],
      total: count || 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Error in getInvoicesWithFilters:", error);
    return { invoices: [], total: 0, page: 1, pageSize: INVOICE_PAGE_SIZE };
  }
}

/**
 * Get overdue invoices
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of overdue invoices
 */
export async function getOverdueInvoices(userId) {
  return getInvoicesWithFilters(userId, {
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
    const today = new Date().toISOString().split("T")[0];
    const base = () =>
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_deleted", false);

    const [
      totalRes,
      paidRes,
      unpaidRes,
      canceledRes,
      overdueRes,
      paidAmounts,
      unpaidAmounts,
      overdueRows,
    ] = await Promise.all([
      base(),
      base().eq("status_id", 3),
      base().in("status_id", [1, 2]),
      base().eq("status_id", 4),
      base().in("status_id", [1, 2]).lt("due_date", today),
      supabase
        .from("invoices")
        .select("total_amount")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .eq("status_id", 3),
      supabase
        .from("invoices")
        .select("total_amount")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .in("status_id", [1, 2]),
      supabase
        .from("invoices")
        .select("total_amount, due_date")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .eq("is_paid", false)
        .eq("is_canceled", false)
        .lt("due_date", today),
    ]);

    const paidList = paidAmounts.data || [];
    const unpaidList = unpaidAmounts.data || [];
    const overdueList = overdueRows.data || [];
    const totalRevenue = paidList.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );
    const unpaidAmount = unpaidList.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );
    const overdueAmount = overdueList.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );
    const overdueDays =
      overdueList.length === 0
        ? 0
        : Math.round(
            overdueList.reduce((sum, inv) => {
              const dueDate = new Date(inv.due_date);
              return (
                sum +
                Math.max(
                  0,
                  Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                )
              );
            }, 0) / overdueList.length
          );

    return {
      total: totalRes.count || 0,
      paid: paidRes.count || 0,
      unpaid: unpaidRes.count || 0,
      canceled: canceledRes.count || 0,
      overdue: overdueRes.count || 0,
      totalRevenue,
      unpaidAmount,
      overdueAmount,
      overdueAverageDays: overdueDays,
    };
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
      overdueAmount: 0,
      overdueAverageDays: 0,
    };
  }
}
