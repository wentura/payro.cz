/**
 * Subscription Status Component
 *
 * Shows current subscription plan, usage, and limits
 * Server Component - receives data as props
 */

import Link from "next/link";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function SubscriptionStatus({ subscription }) {
  if (!subscription) {
    return (
      <Card>
        <div className="text-center py-4">
          <p className="text-gray-500">
            Něco se pokazilo. Ale klid, zkus to znovu.
          </p>
        </div>
      </Card>
    );
  }

  const { currentPlan, currentUsage, canCreateInvoice, usagePercentage } =
    subscription;

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

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    return "text-green-600";
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <Card className="mx-auto p-2 col-span-1 w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentPlan.plan_name} plán
            </h3>
          </div>

          {(currentPlan.plan_name === "Free" ||
            currentPlan.plan_name === "Pro") && (
            <Link href="/subscription/upgrade">
              <Button variant="primary" size="sm">
                {currentPlan.plan_name === "Free"
                  ? "Upgradovat"
                  : "Změnit plán"}
              </Button>
            </Link>
          )}
        </div>

        {/* Usage Stats */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Faktury tento měsíc
              </span>
              <span
                className={`text-sm font-semibold ${getUsageColor(
                  usagePercentage
                )}`}
              >
                {currentUsage}
                {currentPlan.invoice_limit_monthly > 0 && (
                  <span className="text-gray-500">
                    {" "}
                    / {currentPlan.invoice_limit_monthly}
                  </span>
                )}
                {currentPlan.invoice_limit_monthly === 0 && (
                  <span className="text-gray-500"> / ∞</span>
                )}
              </span>
            </div>

            {currentPlan.invoice_limit_monthly > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(
                    usagePercentage
                  )}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Limit Warning */}
          {!canCreateInvoice && (
            <div className="rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-700">
                <p className="text-left">
                  Dosáhli jste měsíčního limitu{" "}
                  {currentPlan.invoice_limit_monthly} faktur. Upgradujte svůj
                  plán pro vytvoření dalších faktur.
                </p>
              </div>
            </div>
          )}

          {/* Plan Features */}
          <div className="border-t pt-4 text-left px-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Funkce vašeho plánu:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {currentPlan.invoice_limit_monthly === 0
                  ? "Neomezené faktury"
                  : `${currentPlan.invoice_limit_monthly} faktur měsíčně`}
              </li>
              {currentPlan.features?.basic_support && (
                <li className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Základní podpora
                </li>
              )}
              {currentPlan.features?.priority_support && (
                <li className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Prioritní podpora
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
