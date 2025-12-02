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

    router.push(`/invoices?${params.toString()}`);
  };

  return (
    <div className="flex items-center">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={includeCancelled}
          onChange={handleToggle}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span className="ml-2 text-sm text-gray-700">
          Zobrazit stornované faktury
        </span>
      </label>
    </div>
  );
}

