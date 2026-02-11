/**
 * Wrapper for ActivateInvoiceButton
 *
 * Server wrapper that renders client component
 */

import ActivateInvoiceButton from "./ActivateInvoiceButton";

export default function ActivateInvoiceButtonWrapper({ invoiceId }) {
  return <ActivateInvoiceButton invoiceId={invoiceId} />;
}

