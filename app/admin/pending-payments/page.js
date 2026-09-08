/**
 * Admin Pending Payments Page
 *
 * Lists all users with pending payment subscriptions
 */

import ServerLayout from "@/app/components/ServerLayout";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser, isAdminUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { formatDateCZ } from "@/app/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getPendingPayments() {
  try {
    // Get all users with pending payment subscriptions
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        contact_email,
        company_id,
        created_at,
        user_subscriptions!inner(
          id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          billing_cycle,
          variable_symbol,
          subscription_plans!inner(
            id,
            name,
            price_monthly,
            price_yearly,
            invoice_limit_monthly,
            features
          )
        )
      `
      )
      .eq("user_subscriptions.status", "pending_payment");

    if (usersError) {
      console.error("Error fetching pending payments:", usersError);
      return [];
    }

    // Process users with pending payments
    const pendingPayments = users.map((user) => {
      const subscription = user.user_subscriptions[0];
      const plan = subscription?.subscription_plans;

      // Calculate amount based on billing cycle
      const amount =
        subscription.billing_cycle === "yearly"
          ? plan.price_yearly
          : plan.price_monthly;

      return {
        id: user.id,
        name: user.name,
        email: user.contact_email,
        company_id: user.company_id,
        created_at: user.created_at,
        subscription: {
          id: subscription.id,
          plan: plan,
          status: subscription.status,
          billing_cycle: subscription.billing_cycle,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end,
          variable_symbol: subscription.variable_symbol,
          amount: amount,
        },
      };
    });

    return pendingPayments;
  } catch (error) {
    console.error("Error in getPendingPayments:", error);
    return [];
  }
}

export default async function PendingPaymentsPage() {
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

  const pendingPayments = await getPendingPayments();

  return (
    <ServerLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Čekající platby
            </h1>
            <p className="mt-2 text-gray-600">
              Uživatelé s předplatnými čekajícími na platbu
            </p>
          </div>
          <Link href="/admin">
            <Button variant="secondary">Zpět do administrace</Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {pendingPayments.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Celkem čekajících plateb
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {
                  pendingPayments.filter(
                    (p) => p.subscription.billing_cycle === "monthly"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Měsíční předplatné
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {
                  pendingPayments.filter(
                    (p) => p.subscription.billing_cycle === "yearly"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500 mt-1">Roční předplatné</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {pendingPayments
                  .reduce((sum, p) => sum + p.subscription.amount, 0)
                  .toLocaleString("cs-CZ")}{" "}
                CZK
              </div>
              <div className="text-sm text-gray-500 mt-1">Celková částka</div>
            </div>
          </Card>
        </div>

        {/* Pending Payments List */}
        <Card title="Seznam čekajících plateb">
          {pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Žádné čekající platby
              </h3>
              <p className="text-gray-500">
                Všechny předplatné jsou aktivní nebo nejsou žádné čekající
                platby.
              </p>
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
                      Částka
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variabilní symbol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Období
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
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.email}
                          </div>
                          {payment.company_id && (
                            <div className="text-xs text-gray-400">
                              IČO: {payment.company_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Badge
                            variant={
                              payment.subscription.plan.name === "Pro"
                                ? "primary"
                                : "success"
                            }
                          >
                            {payment.subscription.plan.name}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {payment.subscription.billing_cycle === "monthly"
                              ? "Měsíční"
                              : "Roční"}
                          </div>
                          <div className="text-xs text-yellow-600 font-medium">
                            Čeká na platbu
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.subscription.amount.toLocaleString("cs-CZ")}{" "}
                          CZK
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.subscription.billing_cycle === "monthly"
                            ? "měsíčně"
                            : "ročně"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {payment.subscription.variable_symbol || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.subscription.period_start
                            ? formatDateCZ(payment.subscription.period_start)
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          do{" "}
                          {payment.subscription.period_end
                            ? formatDateCZ(payment.subscription.period_end)
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateCZ(payment.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/subscriptions?user=${payment.id}`}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Aktivovat
                          </Link>
                          <Link
                            href={`/admin/subscriptions?user=${payment.id}`}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Správa
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card title="Instrukce pro zpracování plateb">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Jak zpracovat čekající platby:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>
                  Ověřte příchod platby na bankovní účet podle variabilního
                  symbolu
                </li>
                <li>Klikněte na &quot;Správa&quot; u konkrétního uživatele</li>
                <li>
                  V administraci předplatných klikněte na &quot;Aktivovat
                  předplatné&quot;
                </li>
                <li>
                  Předplatné se automaticky aktivuje a uživatel získá přístup k
                  funkcím
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Bankovní údaje:
              </h4>
              <div className="text-sm text-yellow-800">
                <p>
                  <strong>Číslo účtu:</strong> 1234567890/0800
                </p>
                <p>
                  <strong>Variabilní symbol:</strong> Viz tabulka výše
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ServerLayout>
  );
}
