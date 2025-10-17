/**
 * Subscription Upgrade Form Component
 *
 * Handles subscription plan upgrades with payment processing
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Modal from "./ui/Modal";

export default function SubscriptionUpgradeForm({
  currentSubscription,
  onUpgradeSuccess,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailablePlans();
  }, [fetchAvailablePlans]);

  const fetchAvailablePlans = useCallback(async () => {
    try {
      const response = await fetch("/api/subscription/plans");
      const data = await response.json();

      if (data.success) {
        // Filter out the current plan and inactive plans
        const currentPlanId = currentSubscription?.currentPlan?.plan_id;
        const filteredPlans = data.data.filter(
          (plan) => plan.is_active && plan.id !== currentPlanId
        );
        setAvailablePlans(filteredPlans);

        // Auto-select the first available plan
        if (filteredPlans.length > 0) {
          setSelectedPlan(filteredPlans[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      setError("Chyba při načítání plánů");
    } finally {
      setLoadingPlans(false);
    }
  }, [currentSubscription]);

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError("Prosím vyberte plán");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Handle successful upgrade
        if (data.paymentUrl) {
          // Redirect to payment
          window.location.href = data.paymentUrl;
        } else {
          // Direct upgrade success (e.g., free to paid)
          onUpgradeSuccess(data.subscription);
          setIsOpen(false);
          onClose?.();
        }
      } else {
        setError(data.error || "Chyba při upgradu předplatného");
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      setError("Chyba při upgradu předplatného");
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = (plan) => {
    return billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly;
  };

  const calculateSavings = (plan) => {
    if (billingCycle === "yearly") {
      const monthlyTotal = plan.price_monthly * 12;
      return monthlyTotal - plan.price_yearly;
    }
    return 0;
  };

  const getPlanBadgeVariant = (planName) => {
    switch (planName.toLowerCase()) {
      case "free":
        return "secondary";
      case "pro":
        return "primary";
      case "business":
        return "success";
      default:
        return "secondary";
    }
  };

  if (loadingPlans) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          onClose?.();
        }}
        size="lg"
        title="Upgradovat předplatné"
        showCloseButton={true}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        onClose?.();
      }}
      size="lg"
      title="Upgradovat předplatné"
      showCloseButton={true}
    >
      <div className="max-w-full">
        <div className="mb-6">
          <p className="text-gray-600">
            Vyberte si plán, který nejlépe vyhovuje vašim potřebám
          </p>
        </div>

        {/* Current Plan */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Aktuální plán</h3>
          <div className="flex items-center space-x-2">
            <Badge
              variant={getPlanBadgeVariant(
                currentSubscription?.currentPlan?.plan_name
              )}
            >
              {currentSubscription?.currentPlan?.plan_name}
            </Badge>
            <span className="text-sm text-gray-600">
              {currentSubscription?.currentPlan?.invoice_limit_monthly === 0
                ? "Neomezené faktury"
                : `${currentSubscription?.currentPlan?.invoice_limit_monthly} faktur měsíčně`}
            </span>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fakturační cyklus
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Měsíčně
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative ${
                billingCycle === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ročně
              {billingCycle !== "yearly" && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -2 měsíce
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Dostupné plány</h3>
          <div className="space-y-3">
            {availablePlans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const price = calculatePrice(plan);
              const savings = calculateSavings(plan);

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedPlan(plan)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPlanBadgeVariant(plan.name)}>
                            {plan.name}
                          </Badge>
                          {savings > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Ušetříte {savings.toLocaleString("cs-CZ")} Kč
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {plan.invoice_limit_monthly === 0
                            ? "Neomezené faktury"
                            : `${plan.invoice_limit_monthly} faktur měsíčně`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {price.toLocaleString("cs-CZ")} Kč
                      </div>
                      <div className="text-xs text-gray-500">
                        {billingCycle === "yearly" ? "za rok" : "za měsíc"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Shrnutí</h4>
            <div className="text-sm text-blue-800">
              <div>
                Plán: <strong>{selectedPlan.name}</strong>
              </div>
              <div>
                Fakturace:{" "}
                <strong>
                  {billingCycle === "yearly" ? "Roční" : "Měsíční"}
                </strong>
              </div>
              <div>
                Cena:{" "}
                <strong>
                  {calculatePrice(selectedPlan).toLocaleString("cs-CZ")} Kč
                </strong>
              </div>
              {calculateSavings(selectedPlan) > 0 && (
                <div className="text-green-700 font-medium">
                  Úspora:{" "}
                  {calculateSavings(selectedPlan).toLocaleString("cs-CZ")} Kč
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            disabled={isLoading}
          >
            Zrušit
          </Button>
          <Button
            variant="primary"
            onClick={handleUpgrade}
            disabled={isLoading || !selectedPlan}
          >
            {isLoading ? "Zpracovávám..." : "Upgradovat"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
