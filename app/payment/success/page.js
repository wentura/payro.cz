/**
 * Payment Success Page
 *
 * Displays payment success confirmation
 */

import Layout from "@/app/components/Layout";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PaymentSuccessPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { subscription_id, amount, plan_name, billing_cycle } = searchParams;

  return (
    <Layout user={user}>
      <div className="max-w-2xl mx-auto py-12">
        <div>
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Platba byla úspěšná!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Děkujeme za upgrade vašeho předplatného. Vaše nové funkce jsou
              nyní aktivní.
            </p>

            {/* Payment Details */}
            {(plan_name || amount) && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detaily platby
                </h3>
                <div className="space-y-2 text-left">
                  {plan_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plán:</span>
                      <span className="font-medium text-black">
                        {plan_name}
                      </span>
                    </div>
                  )}
                  {billing_cycle && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fakturace:</span>
                      <span className="font-medium text-black">
                        {billing_cycle === "yearly" ? "Roční" : "Měsíční"}
                      </span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Částka:</span>
                      <span className="font-medium text-black">
                        {parseFloat(amount).toLocaleString("cs-CZ")} CZK
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-black">Stav:</span>
                    <span className="font-medium text-green-600">
                      Zaplaceno
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Co dál?
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Vaše předplatné bude brzy aktivováno.
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Můžete vytvářet neomezené množství faktur.
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Získáte prioritní podporu.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="primary" className="w-full sm:w-auto">
                  Jít na Dashboard
                </Button>
              </Link>
              <Link href="/invoices/new">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Vytvořit fakturu
                </Button>
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6">
              <p className="text-sm text-gray-500">
                Máte otázky? Kontaktujte nás na{" "}
                <a
                  href="mailto:podpora@payro.cz"
                  className="text-blue-600 hover:text-blue-800"
                >
                  info@payro.cz
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
