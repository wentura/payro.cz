import ServerLayout from "@/app/components/ServerLayout";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser, isAdminUser } from "@/app/lib/auth";
import {
  getAllUsersWithStats,
  getSubscriptionStats,
} from "@/app/lib/services/AdminService";
import { getPlans } from "@/app/lib/services/getPlans";
import { formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeactivateUserButtonWrapper from "@/app/components/DeactivateUserButtonWrapper";
import AdminChangePlanButton from "@/app/components/AdminChangePlanButton";
import SoftDeleteUserButtonWrapper from "@/app/components/SoftDeleteUserButtonWrapper";

/**
 * Admin Page
 *
 * Only accessible by admin user (svoboda.zbynek@gmail.com)
 */

const FILTERS = [
  { id: "active", label: "Aktivní" },
  { id: "deactivated", label: "Deaktivovaní" },
  { id: "deleted", label: "Smazaní" },
  { id: "all", label: "Všichni" },
];

export default async function AdminPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  if (!isAdminUser(user)) {
    return (
      <ServerLayout user={user}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přístup odepřen
          </h1>
          <p className="text-gray-600">
            Tato stránka je přístupná pouze administrátorům.
          </p>
        </div>
      </ServerLayout>
    );
  }

  // Get all users with stats and subscription data
  const [allUsers, subscriptionStats, availablePlans] = await Promise.all([
    getAllUsersWithStats(),
    getSubscriptionStats(),
    getPlans(),
  ]);
  const resolvedSearchParams = await searchParams;
  const currentFilter = resolvedSearchParams?.filter || "active";
  const filteredUsers = allUsers.filter((userData) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "deleted") return userData.deleted_at !== null;
    if (currentFilter === "deactivated") {
      return userData.deactivated_at !== null && userData.deleted_at === null;
    }
    return userData.deactivated_at === null && userData.deleted_at === null;
  });

  return (
    <ServerLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrace</h1>
          <p className="mt-2 text-gray-600">
            Administrátorské nástroje a přehled systému
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {allUsers.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Celkem uživatelů</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {
                  allUsers.filter(
                    (u) =>
                      u.subscription?.status === "active" &&
                      u.subscription?.plan?.id > 1
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Aktivní placená předplatné
              </div>
            </div>
          </Card>
          <Card>
            <Link href="/admin/pending-payments" className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {
                  allUsers.filter(
                    (u) => u.subscription?.status === "pending_payment"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500 mt-1">Čeká na platbu</div>
            </Link>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {allUsers.reduce((sum, u) => sum + u.stats.totalInvoices, 0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Celkem faktur</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {subscriptionStats
                  ? subscriptionStats
                      .reduce(
                        (sum, plan) =>
                          sum + plan.monthlyRevenue + plan.yearlyRevenue,
                        0
                      )
                      .toLocaleString("cs-CZ") + " CZK"
                  : "0 CZK"}
              </div>
              <div className="text-sm text-gray-500 mt-1">Měsíční příjem</div>
            </div>
          </Card>
        </div>

        {/* Subscription Plans Overview */}
        {subscriptionStats && (
          <Card title="Přehled předplatných">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plán
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena/měsíc
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktivní placení uživatelé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Měsíční příjem
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Limit faktur
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptionStats.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Badge
                            variant={
                              plan.name === "Free"
                                ? "secondary"
                                : plan.name === "Pro"
                                ? "primary"
                                : "success"
                            }
                          >
                            {plan.name}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.price_monthly.toLocaleString("cs-CZ")} CZK
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.activeSubscriptions}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {(
                          plan.monthlyRevenue + plan.yearlyRevenue
                        ).toLocaleString("cs-CZ")}{" "}
                        CZK
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.invoice_limit_monthly === 0
                          ? "Neomezeno"
                          : plan.invoice_limit_monthly}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Users List with Subscription Info */}
        <Card title="Uživatelé a předplatné">
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Link
                key={filter.id}
                href={`/admin?filter=${filter.id}`}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  currentFilter === filter.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Žádní uživatelé nenalezeni</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uživatel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Předplatné
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Využití
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faktury
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrován
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userData.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.contact_email}
                          </div>
                          {userData.company_id && (
                            <div className="text-xs text-gray-400">
                              IČO: {userData.company_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Badge
                            variant={
                              userData.subscription?.plan?.name === "Free"
                                ? "secondary"
                                : userData.subscription?.plan?.name === "Pro"
                                ? "primary"
                                : "success"
                            }
                          >
                            {userData.subscription?.plan?.name || "N/A"}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {userData.subscription?.plan?.id === 1
                              ? "Free plán"
                              : userData.subscription?.status === "active"
                              ? "Aktivní"
                              : userData.subscription?.status ===
                                "pending_payment"
                              ? "Čeká na platbu"
                              : userData.subscription?.status === "canceled"
                              ? "Zrušené"
                              : "Neaktivní"}
                          </div>
                          {userData.subscription?.billingCycle && (
                            <div className="text-xs text-gray-400">
                              {userData.subscription.billingCycle === "monthly"
                                ? "Měsíčně"
                                : "Ročně"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {userData.subscription?.currentUsage || 0}
                            </span>
                            <span className="text-gray-500">
                              /{" "}
                              {userData.subscription?.plan
                                ?.invoice_limit_monthly === 0
                                ? "∞"
                                : userData.subscription?.plan
                                    ?.invoice_limit_monthly || 0}
                            </span>
                          </div>
                          {userData.subscription?.plan?.invoice_limit_monthly >
                            0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  userData.subscription.currentUsage /
                                    userData.subscription.plan
                                      .invoice_limit_monthly >=
                                  0.9
                                    ? "bg-red-500"
                                    : userData.subscription.currentUsage /
                                        userData.subscription.plan
                                          .invoice_limit_monthly >=
                                      0.75
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (userData.subscription.currentUsage /
                                      userData.subscription.plan
                                        .invoice_limit_monthly) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          )}
                          {!userData.subscription?.canCreateInvoice && (
                            <div className="text-xs text-red-600 font-medium">
                              Limit dosažen
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.stats.totalInvoices} celkem
                          </div>
                          <div className="flex space-x-1">
                            <Badge variant="paid" className="text-xs">
                              {userData.stats.paidInvoices}
                            </Badge>
                            <Badge variant="unpaid" className="text-xs">
                              {userData.stats.unpaidInvoices}
                            </Badge>
                          </div>
                          {userData.stats.totalRevenue > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              {userData.stats.totalRevenue.toLocaleString(
                                "cs-CZ"
                              )}{" "}
                              CZK
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateCZ(userData.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <AdminChangePlanButton
                              userId={userData.id}
                              currentPlanId={userData.subscription?.plan?.id}
                              currentBillingCycle={
                                userData.subscription?.billingCycle || "monthly"
                              }
                              initialPlans={availablePlans}
                            />
                            <button className="text-orange-600 hover:text-orange-900 text-xs">
                              Detaily
                            </button>
                          </div>
                          <DeactivateUserButtonWrapper
                            userId={userData.id}
                            isDeactivated={userData.deactivated_at !== null}
                          />
                          <SoftDeleteUserButtonWrapper
                            userId={userData.id}
                            isDeleted={userData.deleted_at !== null}
                            isDeactivated={userData.deactivated_at !== null}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Subscription Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/subscriptions">
            <Button variant="primary">Správa předplatných</Button>
          </Link>
          <Link href="/admin/pending-payments">
            <Button variant="warning">
              Čekající platby (
              {
                allUsers.filter(
                  (u) => u.subscription?.status === "pending_payment"
                ).length
              }
              )
            </Button>
          </Link>
        </div>
      </div>
    </ServerLayout>
  );
}
