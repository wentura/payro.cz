"use client";

/**
 * Deactivate User Button Component
 *
 * Client component for deactivating/reactivating users in admin panel
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function DeactivateUserButton({ userId, isDeactivated }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async () => {
    setIsLoading(true);
    setError("");

    try {
      const action = isDeactivated ? "reactivate" : "deactivate";
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při změně stavu uživatele");
        setIsLoading(false);
        return;
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      console.error("Error toggling user deactivation:", err);
      setError("Neočekávaná chyba při změně stavu uživatele");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant={isDeactivated ? "success" : "danger"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className="text-xs"
      >
        {isLoading
          ? isDeactivated
            ? "Reaktivuji..."
            : "Deaktivuji..."
          : isDeactivated
          ? "Reaktivovat"
          : "Deaktivovat"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}


