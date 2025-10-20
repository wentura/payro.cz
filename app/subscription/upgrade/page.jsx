/**
 * Subscription Upgrade Page
 *
 * Dedicated page for subscription plan upgrades
 */

"use client";

import Layout from "@/app/components/Layout";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubscriptionUpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      // Get current user
      const userResponse = await fetch("/api/user/profile");
      const userData = await userResponse.json();

      if (userData.success) {
        setUser(userData.data);
      }

      // Get current subscription
      const subscriptionResponse = await fetch("/api/user/subscription");
      const subscriptionData = await subscriptionResponse.json();

      if (subscriptionData.success) {
        setCurrentSubscription(subscriptionData.data);
      }

      // Get available plans
      await fetchAvailablePlans();
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Chyba při načítání dat");
    }
  };

  const fetchAvailablePlans = async () => {
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
  };

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

  if (!user) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center text-gray-600 text-2xl font-bold">
          Načítání...
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upgradovat předplatné
          </h1>
        </div>

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
                      {currentSubscription?.currentPlan
                        ?.invoice_limit_monthly === 0
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

        {loadingPlans ? (
          <Card>
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Billing Cycle Toggle */}
            <div className="mb-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fakturační cyklus
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
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
                        -2 měsíce
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="mb-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Dostupné plány
                </h3>
                <div className="grid gap-4">
                  {availablePlans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id;
                    const price = calculatePrice(plan);
                    const savings = calculateSavings(plan);

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedPlan(plan)}
                              className="text-blue-600 w-5 h-5"
                            />
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge
                                  variant={getPlanBadgeVariant(plan.name)}
                                  className="text-base px-3 py-1"
                                >
                                  {plan.name}
                                </Badge>
                                {savings > 0 && (
                                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                    Ušetříte {savings.toLocaleString("cs-CZ")}{" "}
                                    Kč
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-600">
                                {plan.invoice_limit_monthly === 0
                                  ? "Neomezené faktury"
                                  : `${plan.invoice_limit_monthly} faktur měsíčně`}
                              </div>
                              {plan.description && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {plan.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {price.toLocaleString("cs-CZ")} Kč
                            </div>
                            <div className="text-sm text-gray-500">
                              {billingCycle === "yearly"
                                ? "za rok"
                                : "za měsíc"}
                            </div>
                            {billingCycle === "yearly" && (
                              <div className="text-xs text-green-600 font-medium mt-1">
                                = {Math.round(price / 12)} Kč/měsíc
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                      <h3 className="text-sm font-medium text-red-800">
                        Chyba
                      </h3>
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
                      <div className="text-lg font-bold">
                        {selectedPlan.name}
                      </div>
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
                        {calculatePrice(selectedPlan).toLocaleString("cs-CZ")}{" "}
                        Kč
                      </div>
                    </div>
                    {calculateSavings(selectedPlan) > 0 && (
                      <div>
                        <div className="font-medium">Úspora:</div>
                        <div className="text-lg font-bold text-green-700">
                          {calculateSavings(selectedPlan).toLocaleString(
                            "cs-CZ"
                          )}{" "}
                          Kč
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
        )}
      </div>
    </Layout>
  );
}
