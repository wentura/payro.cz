"use client";

/**
 * Admin Change Plan Button
 *
 * Client component for admin plan changes
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/Modal";
import Select from "@/app/components/ui/Select";

const BILLING_OPTIONS = [
  { value: "monthly", label: "Měsíčně" },
  { value: "yearly", label: "Ročně" },
];

export default function AdminChangePlanButton({
  userId,
  currentPlanId,
  currentBillingCycle,
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(
    currentPlanId ? String(currentPlanId) : ""
  );
  const [billingCycle, setBillingCycle] = useState(
    currentBillingCycle || "monthly"
  );

  useEffect(() => {
    if (!isOpen) return;
    if (plans.length > 0) return;

    const fetchPlans = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/plans");
        const result = await response.json();
        if (!response.ok || !result.success) {
          setError(result.error || "Chyba při načítání plánů");
          setIsLoading(false);
          return;
        }
        const activePlans = (result.data || []).filter(
          (plan) => plan.is_active
        );
        setPlans(activePlans);
        if (!selectedPlanId && activePlans.length > 0) {
          setSelectedPlanId(String(activePlans[0].id));
        }
      } catch (err) {
        console.error("Admin plans fetch error:", err);
        setError("Chyba při načítání plánů");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [isOpen, plans.length, selectedPlanId]);

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: String(plan.id),
        label: plan.name,
      })),
    [plans]
  );

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: parseInt(selectedPlanId, 10),
          billingCycle,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při změně plánu");
        setIsSaving(false);
        return;
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Admin change plan error:", err);
      setError("Neočekávaná chyba při změně plánu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        className="text-blue-600 hover:text-blue-900 text-xs"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Změnit plán
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Změna plánu"
        size="sm"
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Select
            label="Plán"
            name="plan_id"
            value={selectedPlanId}
            onChange={(event) => setSelectedPlanId(event.target.value)}
            options={planOptions}
            disabled={isLoading}
            required
          />

          <Select
            label="Fakturace"
            name="billing_cycle"
            value={billingCycle}
            onChange={(event) => setBillingCycle(event.target.value)}
            options={BILLING_OPTIONS}
            disabled={isLoading}
            required
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Zrušit
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving || !selectedPlanId}
            >
              {isSaving ? "Ukládám..." : "Potvrdit"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
