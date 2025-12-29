"use client";

/**
 * Wrapper for ActivateInvoiceButton
 * 
 * Client component wrapper to enable dynamic import
 */

import dynamic from "next/dynamic";

const ActivateInvoiceButton = dynamic(
  () => import("./ActivateInvoiceButton"),
  { ssr: false }
);

export default function ActivateInvoiceButtonWrapper({ invoiceId }) {
  return <ActivateInvoiceButton invoiceId={invoiceId} />;
}

