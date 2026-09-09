"use client";

/**
 * Show Cancelled Toggle Component
 *
 * Client component for toggling visibility of cancelled invoices
 */

import { useRouter, useSearchParams } from "next/navigation";

export default function ShowCancelledToggle({ includeCancelled }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleToggle = (e) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (e.target.checked) {
      params.set("showCancelled", "true");
    } else {
      params.delete("showCancelled");
    }
    params.delete("page");

    router.push(`/invoices?${params.toString()}`);
  };

  return (
    <div className="flex items-center">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={includeCancelled}
          onChange={handleToggle}
          className="w-4 h-4 text-fktr-accent border-fktr-border rounded focus:ring-fktr-accent focus:ring-2"
        />
        <span className="ml-2 text-sm text-fktr-muted">
          Zobrazit stornované faktury
        </span>
      </label>
    </div>
  );
}

