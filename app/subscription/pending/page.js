/**
 * Subscription Pending Payment Page
 *
 * Shows users that their subscription is waiting for payment
 */

import Layout from "@/app/components/Layout";
import SPAYDQRCode from "@/app/components/SPAYDQRCode";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { getCurrentUser } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

// Generate a random 6-digit variable symbol (not starting with 0)
function generateVariableSymbol() {
  // First digit: 1-9 (not 0)
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  // Remaining 5 digits: 0-9
  const remainingDigits = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `${firstDigit}${remainingDigits}`;
}

export default async function SubscriptionPendingPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { plan_name, billing_cycle, amount, variable_symbol } = searchParams;

  return (
    <Layout user={user}>
      <div className="max-w-2xl mx-auto py-12">
        <div>
          <div className="text-center">
            {/* Pending Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Čekáme na platbu
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Vaše předplatné bylo vytvořeno a čeká na potvrzení platby.
              <br />
              Jakmile obdržíme platbu, aktivujeme vaše nové funkce.
            </p>

            {/* Subscription Details */}
            {(plan_name || amount) && (
              <div className="rounded-lg p-6 mb-8 border border-blue-700">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detaily předplatného
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
                    <span className="text-gray-600">Stav:</span>
                    <span className="font-medium text-yellow-600">
                      Čeká na platbu
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Jak zaplatit?
              </h3>

              {/* QR Code Payment */}
              {amount && variable_symbol && (
                <div className="p-6 mb-6 text-center">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    QR kódem...
                  </h4>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <SPAYDQRCode
                        accountNumber="670100-2210171552/6210"
                        amount={parseFloat(amount)}
                        currency="CZK"
                        message={`Předplatné ${plan_name || "Pro"} plán`}
                        variableSymbol={variable_symbol}
                        size={180}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">
                        Naskenujte QR kód v bankovní aplikaci
                      </p>
                      <p className="text-xs">
                        Kompatibilní se všemi českými bankami
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 text-left">
                <h4 className="text-base font-semibold text-gray-900 mb-4 text-center">
                  nebo bankovním převodem
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 text-sm font-medium">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">
                        Bankovní převod
                      </p>
                      <p className="text-gray-600 text-sm">
                        na bankovní účet{" "}
                        <strong className="px-2 py-1 rounded text-gray-800 font-mono">
                          670100-2210171552/6210
                        </strong>
                      </p>
                      <p className="text-gray-600 text-sm">
                        s variabilním symbolem:{" "}
                        <strong className="px-2 py-1 rounded text-gray-800 font-mono">
                          {variable_symbol || generateVariableSymbol()}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 text-sm font-medium">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Aktivace</p>
                      <p className="text-gray-600 text-sm">
                        vašeho předplatného proběhne během 48 hodin po obdržení
                        platby.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 text-sm font-medium">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">
                        Kontaktujte nás
                      </p>
                      <p className="text-gray-600 text-sm">
                        v případě problémů s platbou na{" "}
                        <a
                          href="mailto:podpora@fktr.cz"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          info@fktr.cz
                        </a>
                      </p>
                    </div>
                  </div>
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
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Máte otázky? Kontaktujte nás na{" "}
                <a
                  href="mailto:info@fktr.cz"
                  className="text-blue-600 hover:text-blue-800"
                >
                  info@fktr.cz
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
