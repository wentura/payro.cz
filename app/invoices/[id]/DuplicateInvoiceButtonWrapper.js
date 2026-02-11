/**
 * Wrapper for DuplicateInvoiceButton
 *
 * Server wrapper that renders client component
 */

import DuplicateInvoiceButton from "./DuplicateInvoiceButton";

export default function DuplicateInvoiceButtonWrapper({ invoiceId }) {
  return <DuplicateInvoiceButton invoiceId={invoiceId} />;
}

