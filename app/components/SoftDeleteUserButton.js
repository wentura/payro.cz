"use client";

/**
 * Soft Delete User Button Component
 *
 * Client component for soft-deleting/restoring users in admin panel
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function SoftDeleteUserButton({
  userId,
  isDeleted,
  isDeactivated,
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async () => {
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isDeleted ? "restore" : "soft-delete";
      const response = await fetch(`/api/admin/users/${userId}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při změně stavu uživatele");
        setIsLoading(false);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("Error toggling user soft-delete:", err);
      setError("Neočekávaná chyba při změně stavu uživatele");
      setIsLoading(false);
    }
  };

  const isDisabled = !isDeleted && !isDeactivated;

  return (
    <div>
      <Button
        type="button"
        variant={isDeleted ? "success" : "danger"}
        size="sm"
        onClick={handleAction}
        disabled={isLoading || isDisabled}
        className="text-xs"
      >
        {isLoading
          ? isDeleted
            ? "Obnovuji..."
            : "Mažu..."
          : isDeleted
          ? "Obnovit"
          : "Soft-delete"}
      </Button>
      {isDisabled && (
        <p className="text-xs text-gray-500 mt-1">
          Nejprve deaktivujte účet
        </p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
