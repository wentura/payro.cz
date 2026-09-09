"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function AdminActivateSubscriptionButton({
  userId,
  subscriptionId,
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleActivate = async () => {
    if (!confirm("Aktivovat předplatné po ověření platby?")) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/subscriptions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscriptionId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "Aktivace selhala");
        setIsLoading(false);
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Neočekávaná chyba");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleActivate}
        disabled={isLoading}
      >
        {isLoading ? "Aktivuji..." : "Aktivovat předplatné"}
      </Button>
      {error && <p className="mt-2 text-sm text-fktr-danger">{error}</p>}
    </div>
  );
}
