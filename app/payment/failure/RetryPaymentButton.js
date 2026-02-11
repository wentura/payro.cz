"use client";

import Button from "@/app/components/ui/Button";

export default function RetryPaymentButton() {
  return (
    <Button
      variant="primary"
      className="w-full sm:w-auto"
      onClick={() => window.history.back()}
    >
      Zopakovat platbu
    </Button>
  );
}
