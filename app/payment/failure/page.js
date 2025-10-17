/**
 * Payment Failure Page
 *
 * Displays payment failure information
 */

import Layout from "@/app/components/Layout";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PaymentFailurePage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { error, plan_name, amount } = searchParams;

  return (
    <Layout user={user}>
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Platba se nezdařila
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Omlouváme se, ale platba nebyla dokončena. Váš předplatný nebyl
              změněn.
            </p>

            {/* Error Details */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Důvod selhání
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Payment Details */}
            {(plan_name || amount) && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detaily pokusu o platbu
                </h3>
                <div className="space-y-2 text-left">
                  {plan_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plán:</span>
                      <span className="font-medium">{plan_name}</span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Částka:</span>
                      <span className="font-medium">
                        {parseFloat(amount).toLocaleString("cs-CZ")} CZK
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stav:</span>
                    <span className="font-medium text-red-600">Neúspěšné</span>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Možné příčiny
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Nedostatečné finanční prostředky na účtu
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Problém s platební kartou
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Dočasný problém s platební bránou
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                Zkusit znovu
              </Button>
              <Link href="/dashboard">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Jít na Dashboard
                </Button>
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Stále máte problémy s platbou?
              </p>
              <p className="text-sm text-gray-500">
                Kontaktujte nás na{" "}
                <a
                  href="mailto:podpora@payro.cz"
                  className="text-blue-600 hover:text-blue-800"
                >
                  podpora@payro.cz
                </a>{" "}
                nebo volejte{" "}
                <a
                  href="tel:+420123456789"
                  className="text-blue-600 hover:text-blue-800"
                >
                  +420 123 456 789
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
