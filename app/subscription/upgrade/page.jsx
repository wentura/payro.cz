/**
 * Subscription Upgrade Page
 *
 * Server component that loads data and passes to client form component
 */

import Layout from "@/app/components/Layout";
import { getCurrentUser } from "@/app/lib/auth";
import { getSubscriptionData } from "@/app/lib/services/getSubscriptionData";
import { getPlans } from "@/app/lib/services/getPlans";
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
        <div className="min-h-screen flex items-center justify-center text-gray-600 text-2xl font-bold">
          Chyba při načítání dat
        </div>
      </Layout>
    );
  }

  // Filter out the current plan and inactive plans
  const currentPlanId = subscriptionData.currentPlan?.plan_id;
  const availablePlans = allPlans.filter(
    (plan) => plan.is_active && plan.id !== currentPlanId
  );

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
