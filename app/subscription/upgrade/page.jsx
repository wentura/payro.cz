/**
 * Subscription Upgrade Page
 *
 * Server component that loads data and passes to client form component
 */

import Layout from "@/app/components/Layout";
import Button from "@/app/components/ui/Button";
import { getCurrentUser } from "@/app/lib/auth";
import { getSubscriptionData } from "@/app/lib/services/getSubscriptionData";
import { getPlans } from "@/app/lib/services/getPlans";
import Link from "next/link";
import { redirect } from "next/navigation";
import SubscriptionUpgradeForm from "./SubscriptionUpgradeForm";

export default async function SubscriptionUpgradePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Load all data in parallel
  const [subscriptionData, allPlans] = await Promise.all([
    getSubscriptionData(user.id),
    getPlans(),
  ]);

  if (!subscriptionData) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-gray-700 text-xl font-semibold">
              Chyba při načítání dat
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/subscription/upgrade">
                <Button variant="primary">Zkusit znovu</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Přejít na přehled</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPlanId = subscriptionData.currentPlan?.plan_id;
  const proPlan = allPlans.find((plan) => plan.is_active && plan.id === 2);
  const availablePlans = proPlan
    ? proPlan.id === currentPlanId
      ? []
      : [proPlan]
    : [];

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upgradovat předplatné
          </h1>
        </div>

        <SubscriptionUpgradeForm
          user={user}
          currentSubscription={subscriptionData}
          availablePlans={availablePlans}
        />
      </div>
    </Layout>
  );
}
