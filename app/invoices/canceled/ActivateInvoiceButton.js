"use client";

/**
 * Activate Invoice Button Component
 *
 * Client component for activating canceled invoices
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function ActivateInvoiceButton({ invoiceId }) {
  const router = useRouter();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");

  const handleActivate = async () => {
    if (
      !confirm(
        "Opravdu chcete aktivovat tuto zrušenou fakturu? Faktura bude znovu zobrazena v seznamu faktur."
      )
    ) {
      return;
    }

    setIsActivating(true);
    setError("");

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/activate`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při aktivaci faktury");
        setIsActivating(false);
        return;
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (err) {
      console.error("Error activating invoice:", err);
      setError("Neočekávaná chyba při aktivaci faktury");
      setIsActivating(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleActivate}
        disabled={isActivating}
        className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
      >
        {isActivating ? "Aktivuji..." : "✓ Aktivovat"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

