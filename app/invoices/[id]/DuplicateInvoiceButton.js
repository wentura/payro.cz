"use client";

/**
 * Duplicate Invoice Button Component
 *
 * Client component for duplicating invoices
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function DuplicateInvoiceButton({ invoiceId }) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState("");

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    setError("");

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/duplicate`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při duplikaci faktury");
        setIsDuplicating(false);
        return;
      }

      // Redirect to invoices list
      router.push("/invoices");
      router.refresh();
    } catch (err) {
      console.error("Error duplicating invoice:", err);
      setError("Neočekávaná chyba při duplikaci faktury");
      setIsDuplicating(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        onClick={handleDuplicate}
        disabled={isDuplicating}
      >
        {isDuplicating ? "Duplikuji..." : "📋 Duplikovat fakturu"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

