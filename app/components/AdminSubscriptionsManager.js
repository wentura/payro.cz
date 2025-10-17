"use client";

/**
 * Admin Subscriptions Manager Component
 *
 * Client-side component for managing user subscriptions
 */

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Select from "@/app/components/ui/Select";
import { formatDateCZ } from "@/app/lib/utils";
import { useCallback, useEffect, useState } from "react";

export default function AdminSubscriptionsManager({
  initialUsers,
  initialPlans,
}) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers || []);
  const [availablePlans, setAvailablePlans] = useState(initialPlans || []);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const [formData, setFormData] = useState({
    planId: "",
    billingCycle: "monthly",
    status: "active",
  });

  const [statusHistory, setStatusHistory] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load user profile
      const userResponse = await fetch("/api/user/profile");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data);
      }

      // Load users with subscriptions
      const usersResponse = await fetch("/api/admin/users-with-subscriptions");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

      // Load available plans
      const plansResponse = await fetch("/api/admin/plans");
      if (!plansResponse.ok) {
        // Fallback to subscription plans API
        const fallbackResponse = await fetch("/api/subscription/plans");
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setAvailablePlans(fallbackData.data || []);
        }
      } else {
        const plansData = await plansResponse.json();
        setAvailablePlans(plansData.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setIsEditing(true);

    if (user?.subscription) {
      setFormData({
        planId: user.subscription.plan_id?.toString() || "",
        billingCycle: user.subscription.billing_cycle || "monthly",
        status: user.subscription.status || "active",
      });
      loadStatusHistory(user.subscription.id);
    } else {
      setFormData({
        planId: "1", // Default to Free plan
        billingCycle: "monthly",
        status: "active",
      });
    }
  };

  const loadStatusHistory = async (subscriptionId) => {
    try {
      const response = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/history`
      );
      if (response.ok) {
        const data = await response.json();
        setStatusHistory(data.data || []);
      }
    } catch (error) {
      console.error("Error loading status history:", error);
    }
  };

  const handleSaveSubscription = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const requestData = {
        userId: selectedUser.id,
        planId: parseInt(formData.planId) || 1, // Default to Free plan if invalid
        billingCycle: formData.billingCycle,
        status: formData.status,
      };

      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        // Reload data
        await loadData();
        setSelectedUser(null);
        setIsEditing(false);
        alert("Předplatné bylo úspěšně aktualizováno");
      } else {
        alert(`Chyba: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("Chyba při ukládání předplatného");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedUser?.subscription) return;

    if (!confirm("Opravdu chcete zrušit toto předplatné?")) return;

    try {
      const response = await fetch("/api/admin/subscriptions/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
        setSelectedUser(null);
        setIsEditing(false);
        alert("Předplatné bylo zrušeno");
      } else {
        alert(`Chyba: ${result.error}`);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("Chyba při rušení předplatného");
    }
  };

  const handleActivateSubscription = async () => {
    if (!selectedUser?.subscription) return;

    const currentStatus = selectedUser.subscription.status;
    const statusText =
      currentStatus === "pending_payment" ? "čekající na platbu" : "zrušené";

    if (!confirm(`Opravdu chcete aktivovat toto ${statusText} předplatné?`))
      return;

    try {
      const response = await fetch("/api/admin/subscriptions/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          subscriptionId: selectedUser.subscription.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
        setSelectedUser(null);
        setIsEditing(false);
        alert("Předplatné bylo aktivováno");
      } else {
        alert(`Chyba při aktivaci předplatného: ${result.error}`);
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      alert("Chyba při aktivaci předplatného");
    }
  };

  const getPlanBadgeVariant = (planId) => {
    switch (planId) {
      case 1:
        return "secondary";
      case 2:
        return "success";
      case 3:
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending_payment":
        return "warning";
      case "canceled":
        return "danger";
      case "past_due":
        return "danger";
      default:
        return "secondary";
    }
  };

  const isSubscriptionOverdue = (subscription) => {
    if (!subscription || subscription.plan_id === 1) return false; // Free plan
    return (
      subscription.periodEnd && new Date(subscription.periodEnd) < new Date()
    );
  };

  const isSubscriptionNearExpiry = (subscription) => {
    if (!subscription || subscription.plan_id === 1) return false; // Free plan
    if (!subscription.periodEnd) return false;

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const periodEnd = new Date(subscription.periodEnd);

    return periodEnd <= sevenDaysFromNow && periodEnd > new Date();
  };

  const getSubscriptionAlert = (subscription) => {
    if (isSubscriptionOverdue(subscription)) {
      return { type: "danger", message: "Po splatnosti" };
    }
    if (isSubscriptionNearExpiry(subscription)) {
      return { type: "warning", message: "Brzy vyprší" };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Načítám...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Správa předplatných
            </h1>
            <p className="mt-2 text-gray-600">
              Spravujte předplatné a účty uživatelů
            </p>
          </div>
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="secondary"
            size="sm"
          >
            {showDebug ? "Skrýt debug" : "Zobrazit debug"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <div className="text-sm font-medium text-gray-500">
            Celkem uživatelů
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {users.length}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-500">
            Aktivní Pro uživatelé
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {
              users.filter(
                (u) =>
                  u.subscription?.status === "active" &&
                  u.subscription?.plan?.id > 1
              ).length
            }
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-500">
            Čeká na platbu
          </div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {
              users.filter((u) => u.subscription?.status === "pending_payment")
                .length
            }
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-500">Po splatnosti</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {users.filter((u) => isSubscriptionOverdue(u.subscription)).length}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-500">Brzy vyprší</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {
              users.filter((u) => isSubscriptionNearExpiry(u.subscription))
                .length
            }
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Users List */}
        <div className="lg:col-span-4">
          <Card title="Uživatelé">
            <div className="space-y-3">
              {users.map((user) => {
                const alert = getSubscriptionAlert(user.subscription);
                return (
                  <div
                    key={user.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedUser?.id === user.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    } ${
                      alert
                        ? `border-${alert.type}-300 bg-${alert.type}-50`
                        : ""
                    }`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {user.name}
                          </h3>
                          {alert && (
                            <Badge variant={alert.type} size="sm">
                              {alert.message}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {user.contact_email}
                        </p>
                        {user.company_id && (
                          <p className="text-xs text-gray-500">
                            IČO: {user.company_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {user.subscription ? (
                          <div className="space-y-1">
                            <Badge
                              variant={getPlanBadgeVariant(
                                user.subscription.plan_id
                              )}
                            >
                              {user.subscription.plan?.name || "Neznámý plán"}
                            </Badge>
                            <Badge
                              variant={getStatusBadgeVariant(
                                user.subscription.status
                              )}
                            >
                              {user.subscription.status === "active"
                                ? "Aktivní"
                                : user.subscription.status === "pending_payment"
                                ? "Čeká na platbu"
                                : user.subscription.status === "canceled"
                                ? "Zrušené"
                                : user.subscription.status}
                            </Badge>
                            {user.subscription.plan_id > 1 && (
                              <div className="text-xs text-gray-500">
                                {user.subscription.billing_cycle === "yearly"
                                  ? "Roční"
                                  : "Měsíční"}
                                {user.subscription.plan?.price_monthly && (
                                  <span className="ml-1">
                                    {user.subscription.billing_cycle ===
                                    "yearly"
                                      ? `${user.subscription.plan.price_yearly} Kč`
                                      : `${user.subscription.plan.price_monthly} Kč`}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">Bez předplatného</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2">
          {isEditing && selectedUser ? (
            <Card title={`Upravit: ${selectedUser.name}`}>
              <div className="space-y-4">
                {/* Current Subscription Info */}
                {selectedUser.subscription && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Aktuální předplatné
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        Plán:{" "}
                        <span className="font-medium">
                          {selectedUser.subscription.plan?.name}
                        </span>
                      </div>
                      <div>
                        Stav:{" "}
                        <Badge
                          variant={getStatusBadgeVariant(
                            selectedUser.subscription.status
                          )}
                          size="sm"
                        >
                          {selectedUser.subscription.status}
                        </Badge>
                      </div>
                      <div>
                        Fakturace:{" "}
                        <span className="font-medium">
                          {selectedUser.subscription.billing_cycle}
                        </span>
                      </div>
                      {selectedUser.subscription.periodStart && (
                        <div>
                          Od:{" "}
                          <span className="font-medium">
                            {formatDateCZ(
                              selectedUser.subscription.periodStart
                            )}
                          </span>
                        </div>
                      )}
                      {selectedUser.subscription.periodEnd && (
                        <div>
                          Do:{" "}
                          <span className="font-medium">
                            {formatDateCZ(selectedUser.subscription.periodEnd)}
                          </span>
                        </div>
                      )}
                      {selectedUser.subscription.plan_id > 1 &&
                        selectedUser.subscription.plan && (
                          <div>
                            Cena:{" "}
                            <span className="font-medium">
                              {selectedUser.subscription.billing_cycle ===
                              "yearly"
                                ? `${selectedUser.subscription.plan.price_yearly} Kč/rok`
                                : `${selectedUser.subscription.plan.price_monthly} Kč/měsíc`}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-3">
                  <Select
                    label="Plán"
                    value={formData.planId}
                    onChange={(e) =>
                      setFormData({ ...formData, planId: e.target.value })
                    }
                    options={availablePlans.map((plan) => ({
                      value: plan.id.toString(),
                      label: `${plan.name} (${plan.price_monthly} Kč/měsíc)`,
                    }))}
                  />

                  <Select
                    label="Fakturační cyklus"
                    value={formData.billingCycle}
                    onChange={(e) =>
                      setFormData({ ...formData, billingCycle: e.target.value })
                    }
                    options={[
                      { value: "monthly", label: "Měsíční" },
                      { value: "yearly", label: "Roční" },
                    ]}
                  />

                  <Select
                    label="Stav"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    options={[
                      { value: "active", label: "Aktivní" },
                      { value: "pending_payment", label: "Čeká na platbu" },
                      { value: "canceled", label: "Zrušené" },
                    ]}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSaveSubscription}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Ukládání..." : "Uložit změny"}
                  </Button>

                  {selectedUser.subscription && (
                    <>
                      {selectedUser.subscription.status === "active" &&
                        selectedUser.subscription.plan_id > 1 && (
                          <Button
                            onClick={handleCancelSubscription}
                            variant="danger"
                            className="w-full"
                          >
                            Zrušit předplatné
                          </Button>
                        )}

                      {(selectedUser.subscription.status ===
                        "pending_payment" ||
                        selectedUser.subscription.status === "canceled") && (
                        <Button
                          onClick={handleActivateSubscription}
                          variant="success"
                          className="w-full"
                        >
                          {selectedUser.subscription.status ===
                          "pending_payment"
                            ? "Aktivovat předplatné"
                            : "Reaktivovat předplatné"}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Status History */}
                {statusHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Historie stavů
                    </h4>
                    <div className="space-y-2">
                      {statusHistory.map((entry, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 border-l-2 border-gray-200 pl-3"
                        >
                          <div className="flex justify-between">
                            <span>
                              {entry.old_status} → {entry.new_status}
                            </span>
                            <span>{formatDateCZ(entry.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card title="Vyberte uživatele">
              <p className="text-gray-600">
                Klikněte na uživatele v seznamu vlevo pro úpravu jeho
                předplatného.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mt-8">
          <Card title="Debug informace">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Uživatel</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {user
                      ? JSON.stringify(user, null, 2)
                      : "Loading user data..."}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Plány ({availablePlans?.length || 0})
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {availablePlans
                      ? JSON.stringify(availablePlans, null, 2)
                      : "Loading plans..."}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Uživatelé ({users?.length || 0})
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {users
                      ? JSON.stringify(users.slice(0, 2), null, 2) + "..."
                      : "Loading users..."}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Formulář</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Vybraný uživatel
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {selectedUser
                      ? JSON.stringify(selectedUser, null, 2)
                      : "No user selected"}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Stav komponenty
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(
                      {
                        loading,
                        isEditing,
                        isLoading,
                        showDebug,
                        statusHistoryLength: statusHistory.length,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  API Endpointy
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>GET /api/user/profile</div>
                    <div>GET /api/admin/users-with-subscriptions</div>
                    <div>GET /api/admin/plans</div>
                    <div>POST /api/admin/subscriptions</div>
                    <div>POST /api/admin/subscriptions/cancel</div>
                    <div>POST /api/admin/subscriptions/activate</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
