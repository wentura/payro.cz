/**
 * Pricing Page
 *
 * Public pricing page for FKTR.cz with 3 tiers
 */

"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  // Pricing calculations
  const monthlyPrice = 55;
  const yearlyPrice = monthlyPrice * 10; // 10 months = 2 months free

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">FKTR</span> ceník
          </h1>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  !isYearly
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Měsíčně
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                  isYearly
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Ročně
                {!isYearly && (
                  <span className="absolute -top-4 -right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    -2 měsíce
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                FKTR Free
              </h3>
              <div className="text-5xl font-bold text-gray-900 mb-4 md:mb-10">
                0 Kč
              </div>

              <p className="text-gray-600">Pro začínající podnikatele</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Neomezeně klientů</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">4 faktury měsíčně</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">České prostředí</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">QR kódy na platbu</p>
                </div>
              </div>
            </div>

            {/* <Link
              href="/register"
              className="block w-full text-center bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Začít zdarma
            </Link> */}
          </div>

          {/* Pro Tier - Highlighted */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all relative">
            {isYearly && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Ušetříte 110 Kč
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                FKTR Pro
              </h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {isYearly ? `${yearlyPrice} Kč` : `${monthlyPrice} Kč`}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {isYearly ? (
                  <div>
                    za rok (ušetříte 110 Kč)
                    <div className="text-xs text-green-600 font-medium mt-1">
                      = {Math.round(yearlyPrice / 12)} Kč/měsíc
                    </div>
                  </div>
                ) : (
                  "za měsíc"
                )}
              </div>
              <p className="text-gray-600">Za jedno espresso měsíčně</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Neomezeně klientů</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Neomezené faktury</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">České prostředí</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">QR kódy na platbu</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Prioritní podpora</p>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Na míru</h3>
              <div className="text-5xl font-bold text-gray-900 mb-4">
                <span className="text-3xl">Individuálně</span>
              </div>
              <p className="text-gray-600">
                Pro větší firmy a specifické potřeby
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Vše z předchozích plánů
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">API přístup</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">Vlastní branding</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 text-xl mr-3 mt-1">✓</div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Dedikovaná podpora
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                S vašimi potřebami se nám neváhejte ozvat, rádi vám vyjdeme
                vstříc
              </p>
            </div> */}

          {/* <Link
              href="mailto:info@fktr.cz"
              className="block w-full text-center bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
            >
              Kontaktovat nás
            </Link> */}
          {/* </div> */}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Často kladené otázky
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mohu kdykoliv změnit plán?
                </h3>
                <p className="text-gray-600">
                  Ano, plán můžete kdykoliv upgradovat nebo downgradovat. Změna
                  se projeví okamžitě.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Jaké platební metody přijímáte?
                </h3>
                <p className="text-gray-600">
                  QR platba / převod na bankovní účet.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Co když překročím limit 4 faktur na bezplatném plánu?
                </h3>
                <p className="text-gray-600">
                  Systém vás upozorní a nabídne upgrade na placený plán. Žádné
                  faktury nebudou ztraceny.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Jak funguje roční předplatné?
                </h3>
                <p className="text-gray-600">
                  Při ročním předplatném platíte pouze za 10 měsíců a dostáváte
                  2 měsíce zdarma.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Připraveni začít fakturovat?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Registraci stihnete do minuty.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Začít zdarma →
          </Link>
        </div>
      </div>
    </div>
  );
}
