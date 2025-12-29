/**
 * Performance Optimization Indexes
 * 
 * Adds composite indexes for better query performance on invoices table
 * These indexes optimize the most common query patterns:
 * - Filtering by user_id and status_id (with is_deleted = false)
 * - Ordering by created_at DESC for user's invoices
 * 
 * Created: 2025-01-27
 * Phase: 3 - Performance Optimization
 */

-- Composite index for filtering invoices by user and status
-- Used in: dashboard, invoices list, paid/unpaid/overdue pages
-- WHERE user_id = X AND status_id = Y AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_invoices_user_status 
  ON invoices(user_id, status_id) 
  WHERE is_deleted = false;

-- Composite index for ordering invoices by creation date
-- Used in: all invoice list pages, dashboard recent invoices
-- WHERE user_id = X AND is_deleted = false ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_invoices_user_created 
  ON invoices(user_id, created_at DESC) 
  WHERE is_deleted = false;

-- Composite index for filtering by user and client
-- Used in: client detail pages, invoice filtering
-- WHERE user_id = X AND client_id = Y AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_invoices_user_client 
  ON invoices(user_id, client_id) 
  WHERE is_deleted = false;

-- Index for overdue invoices query
-- Used in: dashboard, overdue invoices page
-- WHERE user_id = X AND is_deleted = false AND due_date < CURRENT_DATE AND status_id != 3 AND status_id != 4
CREATE INDEX IF NOT EXISTS idx_invoices_user_due_date 
  ON invoices(user_id, due_date) 
  WHERE is_deleted = false AND status_id NOT IN (3, 4);

-- Analyze tables to update statistics
ANALYZE invoices;
ANALYZE clients;
ANALYZE invoice_items;

