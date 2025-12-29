"use client";

/**
 * Wrapper for DuplicateInvoiceButton
 * 
 * Client component wrapper to enable dynamic import
 */

import dynamic from "next/dynamic";

const DuplicateInvoiceButton = dynamic(
  () => import("./DuplicateInvoiceButton"),
  { ssr: false }
);

export default function DuplicateInvoiceButtonWrapper({ invoiceId }) {
  return <DuplicateInvoiceButton invoiceId={invoiceId} />;
}

