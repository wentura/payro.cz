"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function AdminCancelSubscriptionButton({ userId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (
      !confirm(
        "Zrušit placené předplatné a převést uživatele na Free? Uživatel dostane e-mail."
      )
    ) {
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "Zrušení selhalo");
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
        variant="danger"
        size="sm"
        onClick={handleCancel}
        disabled={isLoading}
      >
        {isLoading ? "Ruším..." : "Zrušit → Free"}
      </Button>
      {error && <p className="mt-2 text-sm text-fktr-danger">{error}</p>}
    </div>
  );
}
