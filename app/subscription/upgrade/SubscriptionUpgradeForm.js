"use client";

/**
 * Subscription Upgrade Form Component
 *
 * Client component for subscription upgrade form
 * Receives data as props (loaded on server)
 */

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubscriptionUpgradeForm({
  user,
  currentSubscription,
  availablePlans,
}) {
  const router = useRouter();
  const selectedPlan = availablePlans.length > 0 ? availablePlans[0] : null;
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError("Vyber si plán, prosím");
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
        if (data.redirectUrl) {
          // Redirect to success page
          window.location.href = data.redirectUrl;
        } else if (data.paymentUrl) {
          // Redirect to payment (for future real payment integration)
          window.location.href = data.paymentUrl;
        } else {
          // Direct upgrade success (e.g., free to paid)
          router.push("/dashboard?upgrade=success");
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
    switch (planName?.toLowerCase?.()) {
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

  return (
    <>
      {/* Current Plan */}
      {currentSubscription && (
        <div className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Váš aktuální plán
            </h2>
            <div className="flex items-center space-x-4">
              <Badge
                variant={getPlanBadgeVariant(
                  currentSubscription?.currentPlan?.plan_name
                )}
                className="text-lg px-4 py-2"
              >
                {currentSubscription?.currentPlan?.plan_name}
              </Badge>
              <div className="text-gray-600">
                {currentSubscription?.currentPlan?.invoice_limit_monthly === 0
                  ? "Neomezené faktury"
                  : `${currentSubscription?.currentPlan?.invoice_limit_monthly} faktur měsíčně`}
              </div>
            </div>
            {currentSubscription?.currentUsage !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Využití tento měsíc</span>
                  <span>
                    {currentSubscription.currentUsage} /{" "}
                    {currentSubscription?.currentPlan?.invoice_limit_monthly ===
                    0
                      ? "∞"
                      : currentSubscription?.currentPlan
                          ?.invoice_limit_monthly}
                  </span>
                </div>
                {currentSubscription?.currentPlan?.invoice_limit_monthly >
                  0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (currentSubscription.currentUsage /
                            currentSubscription?.currentPlan
                              ?.invoice_limit_monthly) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pro Plan + Billing Cycle */}
      <div className="mb-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upgrade na plán Pro
          </h3>
          {selectedPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    {selectedPlan.name}
                  </div>
                  <div className="text-gray-600">
                    {selectedPlan.invoice_limit_monthly === 0
                      ? "Neomezené faktury"
                      : `${selectedPlan.invoice_limit_monthly} faktur měsíčně`}
                  </div>
                  {selectedPlan.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedPlan.description}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {calculatePrice(selectedPlan).toLocaleString("cs-CZ")} Kč
                  </div>
                  <div className="text-sm text-gray-500">
                    {billingCycle === "yearly" ? "za rok" : "za měsíc"}
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      {Math.round(
                        calculatePrice(selectedPlan) / 12
                      ).toLocaleString("cs-CZ")}{" "}
                      Kč/měs
                    </div>
                  )}
                  {calculateSavings(selectedPlan) > 0 && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      2 měsíce zdarma
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Fakturační cyklus
                </h4>
                <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "monthly"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Měsíčně
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all relative ${
                      billingCycle === "yearly"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Ročně
                    {billingCycle !== "yearly" && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        2 měsíce zdarma
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Pro plán není aktuálně dostupný.
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-red-200">
          <div className="p-6 bg-red-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
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
                <h3 className="text-sm font-medium text-red-800">Chyba</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="mb-8">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">
              Shrnutí změny
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-900">
              <div>
                <div className="font-medium">Nový plán:</div>
                <div className="text-lg font-bold">{selectedPlan.name}</div>
              </div>
              <div>
                <div className="font-medium">Fakturace:</div>
                <div className="text-lg font-bold">
                  {billingCycle === "yearly" ? "Roční" : "Měsíční"}
                </div>
              </div>
              <div>
                <div className="font-medium">Cena:</div>
                <div className="text-lg font-bold">
                  {calculatePrice(selectedPlan).toLocaleString("cs-CZ")} Kč
                </div>
              </div>
              {calculateSavings(selectedPlan) > 0 && (
                <div>
                  <div className="font-medium">Úspora:</div>
                  <div className="text-lg font-bold text-green-700">
                    2 měsíce zdarma
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-8 py-3"
        >
          Zpět
        </Button>
        <Button
          variant="primary"
          onClick={handleUpgrade}
          disabled={isLoading || !selectedPlan}
          className="px-8 py-3"
        >
          {isLoading ? "Zpracovávám..." : "Upgradovat"}
        </Button>
      </div>
    </>
  );
}



