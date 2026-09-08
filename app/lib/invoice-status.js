export const ALLOWED_INVOICE_STATUS_IDS = [1, 2, 3, 4, 5, 6];

export function isAllowedInvoiceStatusId(statusId) {
  return ALLOWED_INVOICE_STATUS_IDS.includes(Number.parseInt(statusId, 10));
}
